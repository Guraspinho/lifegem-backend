import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../core/database/database.service";

@Injectable()
export class UserService {
	constructor(private readonly databaseService: DatabaseService) {}

	async getUser(userId: number) {
		const user = await this.databaseService.users.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new BadRequestException("User not found");
		}

		return {
			name: user.name,
			surname: user.surname,
			completed_simulations: user.completed_simulations,
			average_score: user.average_score,
			survival_rate: user.survival_rate,
			correct_diagnosis_rate: user.correct_diagnosis_rate,
		};
	}
}
