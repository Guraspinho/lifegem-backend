import {
	CanActivate,
	ExecutionContext,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import jwt from "jsonwebtoken";

export class AccessAuthGuard implements CanActivate {
	private readonly logger = new Logger(AccessAuthGuard.name);

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedException("Invalid or missing auth header");
		}

		try {
			const accessToken = authHeader.split(" ")[1];
			const payload = jwt.verify(
				accessToken,
				process.env.ACCESS_TOKEN_SECRET as string,
			);

			request["user"] = payload;

			return true;
		} catch (error: any) {
			this.logger.error(
				`Access token verification failed: ${error.message}`,
			);

			throw new UnauthorizedException("Invalid or expired access token");
		}
	}
}
