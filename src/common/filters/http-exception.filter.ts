import { Response } from "express";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@/generated/prisma/client";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message =
        typeof exceptionResponse === "object" && exceptionResponse !== null
          ? (exceptionResponse as any).message
          : exceptionResponse;

      response.status(status).json({
        statusCode: status,
        message,
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = this.handlePrismaError(exception);
      response.status(status).json({
        statusCode: status,
        message,
      });
      return;
    }

    console.error("Unhandled exception:", exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          message: "Resource not found",
        };

      case "P2002": {
        const fields = (exception.meta?.target as string[]) || [];
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${fields.join(", ")} already exists`,
        };
      }

      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "A database error occurred",
        };
    }
  }
}
