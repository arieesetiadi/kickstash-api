import { UserRole } from "@/common/enums";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsEnum(UserRole)
  role: string;

  @IsString()
  @IsOptional()
  headline: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  about: string;
}
