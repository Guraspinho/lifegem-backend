import { ApiProperty } from "@nestjs/swagger";
import { FinalReviewType } from "../../chat/types/final-review.type";
import { SessionHistoryEntryType } from "../../chat/types/session-history.type";

export class GetUserSessionResponseDto {
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
	patient_age: number | null;

	@ApiProperty({ nullable: true })
	patient_gender: string | null;

	@ApiProperty({ nullable: true })
	patient_weight: number | null;

	@ApiProperty({ nullable: true })
	known_allergies: string | null;

	@ApiProperty({ nullable: true })
	condition: string | null;

	@ApiProperty({ nullable: true })
	final_diagnosis: string | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty({
		nullable: true,
		description:
			"Structured AI review of the session (parsed from systemAnalysis). Null if the session never completed.",
	})
	systemAnalysis: FinalReviewType | null;

	@ApiProperty({
		isArray: true,
		description:
			"Per-step session history (doctor messages, narrator responses and vitals) used to render charts.",
	})
	history: SessionHistoryEntryType[];
}
