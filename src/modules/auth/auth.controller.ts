import {
  Controller,
  Post,
  HttpCode,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { EnvironmentVariables } from "@/configs/env.validation";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Cookies } from "@/common/decorators/cookies.decorator";

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    const tokens = await this.authService.login(user);
    return tokens;
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const validatedUser = await this.authService.validate(
      loginDto.email,
      loginDto.password,
    );

    if (!validatedUser) {
      throw new UnauthorizedException("Invalid login credentials");
    }

    const tokens = await this.authService.login(validatedUser);
    return tokens;
  }

  @Post("refresh")
  async refresh(
    @Cookies("refresh_token") cookieRefreshToken: string,
    @Body() body: RefreshTokenDto,
  ) {
    const refreshToken = cookieRefreshToken ?? body.refresh_token;
    return this.authService.refresh(refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  async logout(
    @Cookies("refresh_token") cookieRefreshToken: string,
    @Body() body: RefreshTokenDto,
  ) {
    const refreshToken = cookieRefreshToken ?? body.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    return { message: "Logged out successfully" };
  }

  @Get("protected")
  @UseGuards(JwtAuthGuard)
  async protected(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Get("public")
  async public() {
    return this.configService.get("FRONTEND_BASE_URL");
  }
}
