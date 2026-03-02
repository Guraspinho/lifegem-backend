import { Body, Controller, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { CreateUserRequestDto } from "./dto/create-user-request.dto";
import { CreateUserResponseDto } from "./dto/create-user-response.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiResponse({
		type: CreateUserResponseDto,
	})
	@Post("create")
	async createUser(
		@Body() requestBody: CreateUserRequestDto,
	): Promise<CreateUserResponseDto> {
		return await this.usersService.createUser(requestBody);
	}
}
