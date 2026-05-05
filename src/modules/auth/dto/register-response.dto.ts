import { ApiProperty } from "@nestjs/swagger";

export class RegisterResponseDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	email: string;

	@ApiProperty()
	createdAt: Date;
}
