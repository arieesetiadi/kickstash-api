import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(protected prisma: PrismaService) {}

  register() {
    return "Register";
  }

  login() {
    return "Login";
  }
}
