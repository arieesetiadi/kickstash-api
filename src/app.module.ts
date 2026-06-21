import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { validate } from "./configs/env.validation";
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
