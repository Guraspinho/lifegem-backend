import { PrismaClientKnownRequestError } from "@generated-prisma/internal/prismaNamespace";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { type HttpExceptionHandlerType } from "./types/http-exception-handler.type";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let statusCode: number;
		let error: string | object;

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			error = exception.getResponse();
		} else if (
			exception instanceof PrismaClientKnownRequestError &&
			exception.code === "P2002"
		) {
			statusCode = HttpStatus.CONFLICT;
			error = "Email already in use";
		} else if (
			exception instanceof PrismaClientKnownRequestError &&
			exception.code === "P2025"
		) {
			statusCode = HttpStatus.BAD_REQUEST;
			error = "User not found";
		} else {
			statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			error = "Internal server error";
		}

		this.handleException(
			{
				statusCode,
				timestamp: new Date().toISOString(),
				path: request.url,
				error,
			},
			response,
		);
	}

	private handleException(
		exception: HttpExceptionHandlerType,
		response: Response,
	) {
		this.logger.error(exception);
		response.status(exception.statusCode).json(exception);
	}
}
