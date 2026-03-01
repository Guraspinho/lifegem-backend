import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetHealthCheckResponseDto } from "./dto/get-health-check-response.dto";

@ApiTags("Health Check")
@Controller("health-check")
export class HealthCheckController {
	@ApiOperation({
		summary: "Application Health Check",
		description:
			"Pings the server to verify it is actively accepting requests.",
	})
	@ApiResponse({
		description: "The server is healthy and running.",
		type: GetHealthCheckResponseDto,
	})
	@Get()
	getHealthStatus(): GetHealthCheckResponseDto {
		return { health: true };
	}
}
