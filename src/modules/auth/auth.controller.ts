import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
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

	@ApiResponse({
		type: LoginResponseDto,
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
}
