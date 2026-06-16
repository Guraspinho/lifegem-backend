import { ApiProperty } from "@nestjs/swagger";

export class UserSessionDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	specialty: string;

	@ApiProperty()
	status: string;

	@ApiProperty({ nullable: true })
	score: number | null;

	@ApiProperty({ nullable: true })
	patient_survived: boolean | null;

	@ApiProperty({ nullable: true })
	correct_diagnosis: boolean | null;

	@ApiProperty({ nullable: true })
	duration_seconds: number | null;

	@ApiProperty({ nullable: true })
	patient_name: string | null;

	@ApiProperty({ nullable: true })
	condition: string | null;

	@ApiProperty({ nullable: true })
	final_diagnosis: string | null;

	@ApiProperty()
	createdAt: Date;
}

export class GetUserSessionsResponseDto {
	@ApiProperty({ type: [UserSessionDto] })
	sessions: UserSessionDto[];

	@ApiProperty({
		nullable: true,
		description: "Cursor to pass as `cursor` for the next page, or null if there are no more sessions.",
	})
	nextCursor: number | null;
}
