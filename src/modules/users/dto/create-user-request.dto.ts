import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";

export class CreateUserRequestDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsEmail()
	@Transform(({ value }) => value.toLowerCase())
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@MaxLength(32)
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@MaxLength(32)
	surname: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	password: string;
}
