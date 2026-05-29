import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { AccessAuthGuard } from "../../common/guards/access-auth.guard";
import { GetUserResponseDto } from "./dto/get-user-response.dto";
import { UserService } from "./user.service";

@Controller("user")
@UseGuards(AccessAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiResponse({
		type: GetUserResponseDto,
	})
	@Get()
	async getUser(@Req() request: Request): Promise<GetUserResponseDto> {
		const { sub } = request["user"];
		return await this.userService.getUser(sub);
	}
}
