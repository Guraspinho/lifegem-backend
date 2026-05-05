import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { Request, Response } from "express";
import { RefreshAuthGuard } from "../../common/guards/refresh-auth.guard";
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { RefreshResponseDto } from "./dto/refresh-response.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { RegisterResponseDto } from "./dto/register-response.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiResponse({
		type: RegisterResponseDto,
	})
	@Post("register")
	async register(
		@Body() requestBody: RegisterRequestDto,
	): Promise<RegisterResponseDto> {
		return await this.authService.register(requestBody);
	}

	@HttpCode(200)
	@ApiResponse({
		type: LoginResponseDto,
		headers: {
			HttpCode: {
				schema: { type: "number", example: 200 },
			},
		},
	})
	@Post("login")
	async login(
		@Body() requestBody: LoginRequestDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<LoginResponseDto> {
		const { accessToken, refreshToken } =
			await this.authService.login(requestBody);

		response.cookie("refresh_token", refreshToken, {
			maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // true for HTTPS
			sameSite: "strict",
		});

		return { accessToken };
	}

	@HttpCode(200)
	@ApiResponse({
		headers: {
			HttpCode: {
				schema: { type: "number", example: 200 },
			},
		},
	})
	@UseGuards(RefreshAuthGuard)
	@Post("refresh")
	async refresh(@Req() request: Request): Promise<RefreshResponseDto> {
		const userId = request["user"].sub;
		const refreshToken = request["refresh_token"];

		return await this.authService.refresh(userId, refreshToken);
	}
}
