import { ApiProperty } from "@nestjs/swagger";

export class GetUserResponseDto {
	@ApiProperty()
	name: string;

	@ApiProperty()
	surname: string;

	@ApiProperty()
	completed_simulations: number;

	@ApiProperty()
	average_score: number;

	@ApiProperty()
	survival_rate: number;

	@ApiProperty()
	correct_diagnosis_rate: number;
}
