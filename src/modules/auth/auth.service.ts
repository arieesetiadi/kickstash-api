import bcrypt from "bcryptjs";

import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@/common/enums";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dtos/register.dto";
import { UsersService } from "../users/users.service";
import { User } from "@/generated/prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
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
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

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
}
