import { Controller, Post, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Post("register")
  register() {
    return this.authService.register();
  }

  @Post("login")
  @HttpCode(200)
  login() {
    return this.authService.login();
  }
}
