import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health Check")
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@ApiOperation({ 
        summary: "Application Health Check",
        description: "Pings the server to verify it is actively accepting requests." 
    })
	@ApiResponse({
		description: 'The server is healthy and running.',
		example: { health: true },
	})
	@Get("/health-check")
	getHealthStatus(): { health: true } {
		return this.appService.getHealthStatus();
	}
}
