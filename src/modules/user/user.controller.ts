import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { AccessAuthGuard } from "../../common/guards/access-auth.guard";
import { GetUserResponseDto } from "./dto/get-user-response.dto";
import { GetUserSessionResponseDto } from "./dto/get-user-session-response.dto";
import { GetUserSessionsQueryDto } from "./dto/get-user-sessions-query.dto";
import { GetUserSessionsResponseDto } from "./dto/get-user-sessions-response.dto";
import { UserService } from "./user.service";

@Controller("user")
@UseGuards(AccessAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: "Get the authenticated user's profile" })
	@ApiResponse({
		type: GetUserResponseDto,
	})
	@Get()
	async getUser(@Req() request: Request): Promise<GetUserResponseDto> {
		const { sub } = request["user"];
		return await this.userService.getUser(sub);
	}

	@ApiOperation({
		summary: "Get the authenticated user's sessions (cursor paginated)",
	})
	@ApiResponse({
		type: GetUserSessionsResponseDto,
	})
	@Get("sessions")
	async getUserSessions(
		@Req() request: Request,
		@Query() query: GetUserSessionsQueryDto,
	): Promise<GetUserSessionsResponseDto> {
		const { sub } = request["user"];
		return await this.userService.getUserSessions(sub, query);
	}

	@ApiOperation({
		summary: "Get a single session with its AI review and full history",
	})
	@ApiResponse({
		type: GetUserSessionResponseDto,
	})
	@Get("sessions/:id")
	async getUserSession(
		@Req() request: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetUserSessionResponseDto> {
		const { sub } = request["user"];
		return await this.userService.getUserSession(sub, id);
	}
}
