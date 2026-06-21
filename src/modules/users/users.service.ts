import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@/generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(protected prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data, omit: { password: true } });
  }
}
