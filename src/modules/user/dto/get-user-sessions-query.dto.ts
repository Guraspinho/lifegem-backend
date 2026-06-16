import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";

export class GetUserSessionsQueryDto {
	@ApiPropertyOptional({
		description:
			"Id of the last session from the previous page. Omit to fetch the first page.",
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@IsPositive()
	cursor?: number;

	@ApiPropertyOptional({
		description: "Number of sessions to return per page.",
		default: 10,
		minimum: 1,
		maximum: 50,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit: number = 10;
}
