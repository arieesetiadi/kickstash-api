import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { adapter } from '@/lib/prisma';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({ adapter });
  }
}
