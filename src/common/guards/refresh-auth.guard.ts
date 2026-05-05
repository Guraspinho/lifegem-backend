import {
	CanActivate,
	ExecutionContext,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import jwt from "jsonwebtoken";

export class RefreshAuthGuard implements CanActivate {
	private readonly logger = new Logger(RefreshAuthGuard.name);

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const refreshToken = request.cookies["refresh_token"];

		if (!refreshToken) {
			throw new UnauthorizedException("Refresh token not found");
		}

		try {
			const payload = jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET as string,
			);

			request["user"] = payload;
			request["refresh_token"] = refreshToken;

			return true;
		} catch (error: any) {
			this.logger.error(
				`Refresh token verification failed: ${error.message}`,
			);

			throw new UnauthorizedException("Invalid or expired refresh token");
		}
	}
}
