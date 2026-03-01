import { ApiProperty } from "@nestjs/swagger";

export class GetHealthCheckResponseDto {
	@ApiProperty()
	health: true;
}
