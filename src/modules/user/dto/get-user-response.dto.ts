import { ApiProperty } from "@nestjs/swagger";

export class GetUserResponseDto {
	@ApiProperty()
	name: string;

	@ApiProperty()
	surname: string;

	@ApiProperty()
	completed_simulations: number;

	@ApiProperty({
		nullable: true,
		description: "Null until the first completed session.",
	})
	average_score: number | null;

	@ApiProperty({
		nullable: true,
		description: "Percentage. Null until the first completed session.",
	})
	survival_rate: number | null;

	@ApiProperty({
		nullable: true,
		description: "Percentage. Null until the first completed session.",
	})
	correct_diagnosis_rate: number | null;
}
