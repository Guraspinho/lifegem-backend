import {
	ConflictException,
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import argon from "argon2";
import { DatabaseService } from "../../core/database/database.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { RefreshResponseDto } from "./dto/refresh-response.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { RegisterResponseDto } from "./dto/register-response.dto";
import { JwtTokenTypeEnum } from "./enums/jwt-token-type.enum";

@Injectable()
export class AuthService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly jwtService: JwtService,
	) {}
	private readonly logger = new Logger(AuthService.name);

	async register(
		requestBody: RegisterRequestDto,
	): Promise<RegisterResponseDto> {
		try {
			const { password, email, name, surname } = requestBody;

			const passwordHash = await argon.hash(password);
			const response = await this.databaseService.users.create({
				data: {
					email,
					password: passwordHash,
					name,
					surname,
				},
				select: {
					id: true,
					email: true,
					createdAt: true,
				},
			});

			return response;
		} catch (error: any) {
			this.logger.error(error);

			if (error.code === "P2002") {
				throw new ConflictException("Email already in use");
			}

			throw new InternalServerErrorException(
				"Something went wrong, Unable to create the user",
			);
		}
	}

	async login(
		requestBody: LoginRequestDto,
	): Promise<{ accessToken: string; refreshToken: string }> {
		try {
			const { email, password } = requestBody;

			const user = await this.databaseService.users.findUnique({
				where: { email },
			});

			if (!user) {
				throw new UnauthorizedException(
					"Email or password is incorrect",
				);
			}

			const passwordMatches = await argon.verify(user.password, password);
			if (!passwordMatches) {
				throw new UnauthorizedException(
					"Email or password is incorrect",
				);
			}

			const [accessToken, refreshToken] = await Promise.all([
				this.generateJwtToken(JwtTokenTypeEnum.ACCESS, user.id, email),
				this.generateJwtToken(JwtTokenTypeEnum.REFRESH, user.id, email),
			]);

			const hashedRefreshToken = await argon.hash(refreshToken);
			await this.databaseService.users.update({
				where: { id: user.id },
				data: { refreshToken: hashedRefreshToken },
			});

			return { accessToken, refreshToken };
		} catch (error) {
			this.logger.error(error);

			if (error instanceof HttpException) {
				throw error;
			}

			throw new InternalServerErrorException(
				"Something went wrong, Unable to log in",
			);
		}
	}

	async refresh(
		userId: number,
		refreshToken: string,
	): Promise<RefreshResponseDto> {
		try {
			const user = await this.databaseService.users.findUnique({
				where: { id: userId },
			});

			if (!user || !user.refreshToken) {
				throw new UnauthorizedException(
					"Invalid user or refresh token",
				);
			}

			const verifyRefreshToken = await argon.verify(
				user.refreshToken,
				refreshToken,
			);

			if (!verifyRefreshToken) {
				throw new UnauthorizedException("Invalid refresh token");
			}

			const accessToken = await this.generateJwtToken(
				JwtTokenTypeEnum.ACCESS,
				user.id,
				user.email,
			);
			return { accessToken };
		} catch (error) {
			this.logger.error(error);

			if (error instanceof HttpException) {
				throw error;
			}

			throw new InternalServerErrorException(
				"Something went wrong, Unable to refresh the token",
			);
		}
	}

	private async generateJwtToken(
		type: JwtTokenTypeEnum,
		sub: number,
		email: string,
	) {
		const isAccess = type === JwtTokenTypeEnum.ACCESS;

		const secret = isAccess
			? process.env.ACCESS_TOKEN_SECRET
			: process.env.REFRESH_TOKEN_SECRET;

		const expiresIn = (
			isAccess
				? process.env.ACCESS_TOKEN_LIFETIME
				: process.env.REFRESH_TOKEN_LIFETIME
		) as JwtSignOptions["expiresIn"];

		return await this.jwtService.signAsync(
			{ sub, email },
			{ secret, expiresIn },
		);
	}
}
