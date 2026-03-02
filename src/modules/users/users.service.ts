import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import * as argon from "argon2";
import { DatabaseService } from "src/core/database/database.service";
import { CreateUserRequestDto } from "./dto/create-user-request.dto";
import { CreateUserResponseDto } from "./dto/create-user-response.dto";

@Injectable()
export class UsersService {
	constructor(private readonly databaseService: DatabaseService) {}
	private readonly logger = new Logger(UsersService.name);

	async createUser(
		requestBody: CreateUserRequestDto,
	): Promise<CreateUserResponseDto> {
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
		} catch (error) {
			this.logger.error(error.stack);

			if (error.code === "P2002") {
				throw new ConflictException("Email already in use");
			}

			throw new InternalServerErrorException(
				"Something went wrong, Unable to create the user",
			);
		}
	}
}
