import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getHealthStatus(): { health: true } {
		return { health: true };
	}
}
