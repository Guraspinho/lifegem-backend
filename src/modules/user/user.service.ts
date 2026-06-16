import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { FinalReviewType } from "../chat/types/final-review.type";
import { SessionHistoryEntryType } from "../chat/types/session-history.type";
import { DatabaseService } from "../../core/database/database.service";
import { GetUserSessionResponseDto } from "./dto/get-user-session-response.dto";
import { GetUserSessionsQueryDto } from "./dto/get-user-sessions-query.dto";
import { GetUserSessionsResponseDto } from "./dto/get-user-sessions-response.dto";

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

	async getUserSessions(
		userId: number,
		{ cursor, limit }: GetUserSessionsQueryDto,
	): Promise<GetUserSessionsResponseDto> {
		// Fetch one extra row to know whether another page exists.
		const sessions = await this.databaseService.sessions.findMany({
			where: { user_id: userId },
			take: limit + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			orderBy: { id: "desc" },
			select: {
				id: true,
				specialty: true,
				status: true,
				score: true,
				patient_survived: true,
				correct_diagnosis: true,
				duration_seconds: true,
				patient_name: true,
				condition: true,
				final_diagnosis: true,
				createdAt: true,
			},
		});

		const hasMore = sessions.length > limit;
		const page = hasMore ? sessions.slice(0, limit) : sessions;
		const nextCursor = hasMore ? page[page.length - 1].id : null;

		return { sessions: page, nextCursor };
	}

	async getUserSession(
		userId: number,
		sessionId: number,
	): Promise<GetUserSessionResponseDto> {
		// Scope by user_id so a user can never read another user's session.
		const session = await this.databaseService.sessions.findFirst({
			where: { id: sessionId, user_id: userId },
			select: {
				id: true,
				specialty: true,
				status: true,
				score: true,
				patient_survived: true,
				correct_diagnosis: true,
				duration_seconds: true,
				patient_name: true,
				patient_age: true,
				patient_gender: true,
				patient_weight: true,
				known_allergies: true,
				condition: true,
				final_diagnosis: true,
				createdAt: true,
				history: true,
				systemAnalysis: true,
			},
		});

		if (!session) {
			throw new NotFoundException("Session not found");
		}

		const { history, systemAnalysis, ...rest } = session;

		return {
			...rest,
			systemAnalysis: this.parseSystemAnalysis(systemAnalysis),
			history: (history ?? []) as unknown as SessionHistoryEntryType[],
		};
	}

	private parseSystemAnalysis(raw: string | null): FinalReviewType | null {
		if (!raw) {
			return null;
		}

		try {
			return JSON.parse(raw) as FinalReviewType;
		} catch {
			return null;
		}
	}
}
