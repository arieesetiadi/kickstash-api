import {
  Controller,
  Post,
  HttpCode,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { EnvironmentVariables } from "@/configs/env.validation";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    const accessToken = await this.authService.login(user);
    return { access_token: accessToken };
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

    const accessToken = await this.authService.login(validatedUser);

    return { access_token: accessToken };
  }

  @Get("protected")
  @UseGuards(JwtAuthGuard)
  async protected(@Request() req) {
    return req.user;
  }

  @Get("public")
  async public() {
    return this.configService.get("FRONTEND_BASE_URL");
  }
}
