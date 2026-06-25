import bcrypt from "bcryptjs";

import crypto from "crypto";
import ms from "ms";
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@/common/enums";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dtos/register.dto";
import { UsersService } from "../users/users.service";
import { User } from "@/generated/prisma/client";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "@/configs/env.validation";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  SALT_ROUND = 10;

  async register(registerDto: RegisterDto) {
    const userExists = await this.prisma.user.findFirst({
      where: { email: registerDto.email },
      select: { id: true },
    });

    if (userExists) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.SALT_ROUND,
    );

    const user = await this.userService.create({
      ...registerDto,
      role: registerDto.role as UserRole,
      password: hashedPassword,
    });

    return user;
  }

  async login(user: Omit<User, "password">) {
    const accessToken = this.generateAccessToken(user);
    const refresh = this.generateRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        token: refresh.hash,
        familyId: crypto.randomUUID(),
        userId: user.id,
        expiresAt: refresh.expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refresh.token,
    };
  }

  async refresh(refreshToken: string) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException();
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    const accessToken = this.generateAccessToken(storedToken.user);
    const newRefresh = this.generateRefreshToken();

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          isRevoked: true,
        },
      }),

      this.prisma.refreshToken.create({
        data: {
          token: newRefresh.hash,
          familyId: storedToken.familyId,
          userId: storedToken.userId,
          expiresAt: newRefresh.expiresAt,
        },
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: newRefresh.token,
    };
  }

  async logout(refreshToken: string) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
        isRevoked: false,
      },
    });

    if (!storedToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { familyId: storedToken.familyId },
      data: { isRevoked: true },
    });
  }

  // --------
  // Utils
  // --------

  async validate(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      return null;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);
    if (!isPasswordMatch) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  private generateAccessToken(user: Pick<User, "id" | "email" | "role">) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.configService.getOrThrow("JWT_SECRET"),
        expiresIn: this.configService.getOrThrow("JWT_EXPIRES_IN"),
      },
    );
  }

  private generateRefreshToken() {
    const token = crypto.randomBytes(64).toString("hex");

    return {
      token,
      hash: crypto.createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(
        Date.now() +
          ms(
            this.configService.getOrThrow(
              "JWT_REFRESH_EXPIRES_IN",
            ) as ms.StringValue,
          ),
      ),
    };
  }
}
