import { ApiProperty } from "@nestjs/swagger";

export class CreateUserResponseDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	createdAt: Date;
}
