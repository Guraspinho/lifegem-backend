import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";
import jwt from "jsonwebtoken";
import { GenerateResponse } from "ollama";
import { Socket } from "socket.io";
import { AiService } from "../../core/ai/ai.service";
import { generateActiveChatPrompt } from "../../core/ai/prompts/active-chat-message.prompt";
import { generateFinalReviewPrompt } from "../../core/ai/prompts/final-review-prompt";
import { createPatientPrompt } from "../../core/ai/prompts/initial-patient-generation.prompt";
import { DatabaseService } from "../../core/database/database.service";
import { TokenPayloadType } from "../auth/types/token-payload.type";
import { StartSessionDto } from "./dto/start-session.dto";
import { SessionStatusEnum } from "./enums/session-status.enum";
import { FinalReviewType } from "./types/final-review.type";
import { PatientInitialInfoType } from "./types/patient-info.type";
import { PatientVitalsType } from "./types/patient-vitals.type";
import { SessionHistoryType } from "./types/session-history.type";

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name);
	private readonly xmlParser = new XMLParser();
	private activeSessions = new Map<number, SessionHistoryType>();

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly aiService: AiService,
	) {}

	handleConnection(client: Socket): void {
		try {
			const token = client.handshake.query.auth;

			if (typeof token !== "string" || !token) {
				return this.rejectConnection(client, "Missing or invalid auth token");
			}

			const payload = jwt.verify(
				token,
				process.env.ACCESS_TOKEN_SECRET as string,
			) as TokenPayloadType;

			if (!payload.sub) {
				return this.rejectConnection(client, "Invalid token payload");
			}

			client.data.user = payload;
			client.join(payload.sub.toString());
		} catch (error) {
			this.logger.error("Connection rejected", error as Error);
			this.rejectConnection(client, "Invalid or expired token");
		}
	}

	private rejectConnection(client: Socket, message: string): void {
		client.emit("error", { message });
		client.disconnect();
	}

	async handleStartSession(
		client: Socket,
		message: StartSessionDto,
	): Promise<void> {
		const userId = client.data.user.sub;
		const { specialty } = message;

		const status = SessionStatusEnum.ACTIVE;
		const sessionStartTime = new Date();
		const prompt = createPatientPrompt(specialty);

		const { outputMessage, patient } = await this.aiService.generateValidated(
			prompt,
			(response) => this.parseAiResponse<PatientInitialInfoType>(response),
		);

		const {
			patientName,
			patientAge,
			patientGender,
			weight,
			knownAllergies,
			condition,
			...vitals
		} = patient;

		const data = {
			patientName,
			patientAge,
			patientGender,
			weight,
			knownAllergies,
			condition,
		};

		const { id } = await this.databaseService.sessions.create({
			data: {
				user_id: userId,
				specialty: specialty,
				patient_name: patientName,
				patient_age: patientAge,
				patient_gender: patientGender,
				patient_weight: weight,
				known_allergies: knownAllergies,
				condition,
				status,
			},
			select: {
				id: true,
			},
		});

		this.activeSessions.set(id, {
			sessionHistory: [
				{
					userMessage: null,
					systemMessage: outputMessage,
					vitals,
				},
			],
			patient: data,
			finalDiagnosis: "",
		});

		client.data.sessionStartTime = sessionStartTime;
		client.data.sessionId = id;

		await this.databaseService.users.update({
			where: { id: userId },
			data: { completed_simulations: { increment: 1 } },
		});

		client.emit("session:start", { message: outputMessage, patient });
	}

	async handleChatMessage(client: Socket, message: string): Promise<void> {
		const { sessionId } = client.data;

		const session = this.getSession(sessionId);
		const prompt = generateActiveChatPrompt(session, message);

		const { outputMessage, patient: vitals } =
			await this.aiService.generateValidated(prompt, (response) =>
				this.parseAiResponse<PatientVitalsType>(response),
			);

		session.sessionHistory.push({
			userMessage: message,
			systemMessage: outputMessage,
			vitals,
		});

		client.emit("message:done", { outputMessage, patient: vitals });
	}

	handleFinalDiagnosis(client: Socket, message: string): void {
		const { sessionId } = client.data;

		const session = this.getSession(sessionId);
		session.finalDiagnosis = message;
	}

	async handleSessionEnd(client: Socket): Promise<void> {
		const { sessionId } = client.data;
		const session = this.getSession(sessionId);
		const history = session.sessionHistory;

		try {
			const patientSurvivalStatus =
				history[history.length - 1].vitals.patientStatus;

			const sessionDuration =
				(Date.now() - client.data.sessionStartTime.getTime()) / 1000;

			const scores = history
				.filter((h) => h.userMessage !== null)
				.map((h) => h.vitals.answerAccuracy);

			const finalScore = scores.length
				? scores.reduce((a, b) => a + b, 0) / scores.length
				: 0;

			const prompt = generateFinalReviewPrompt(session);
			const review = await this.aiService.generateValidated(
				prompt,
				(response) => this.parseFinalReview(response),
			);

			const patientSurvived = patientSurvivalStatus !== "deceased";

			await this.databaseService.sessions.update({
				where: { id: sessionId },
				data: {
					correct_diagnosis: review.diagnosis.correct,
					systemAnalysis: JSON.stringify(review),
					score: finalScore,
					status: SessionStatusEnum.COMPLETED,
					duration_seconds: sessionDuration,
					final_diagnosis: session.finalDiagnosis,
					patient_survived: patientSurvived,
					history,
				},
				select: { id: true },
			});

			client.emit("session:end", {
				review,
				score: finalScore,
				stepScores: scores,
				patientSurvived,
				durationSeconds: sessionDuration,
				finalDiagnosis: session.finalDiagnosis,
			});
		} finally {
			this.activeSessions.delete(sessionId);
		}
	}

	handleDisconnect(client: Socket): void {
		const sessionId = client.data?.sessionId;

		if (sessionId) {
			this.activeSessions.delete(sessionId);
		}

		this.logger.log(`Client disconnected: ${client.id}`);
	}

	private parseAiResponse<T>(aiResponse: GenerateResponse): {
		outputMessage: string;
		patient: T;
	} {
		const patientData: { message?: string; vitals?: string } =
			this.xmlParser.parse(aiResponse.response);

		if (!patientData?.message || patientData.vitals === undefined) {
			throw new BadRequestException(
				"AI response was missing the message or vitals block",
			);
		}

		const outputMessage = patientData.message;
		const patient = JSON.parse(String(patientData.vitals).trim()) as T;

		return { outputMessage, patient };
	}

	private parseFinalReview(aiResponse: GenerateResponse): FinalReviewType {
		const raw = aiResponse.response;
		const start = raw.indexOf("{");
		const end = raw.lastIndexOf("}");

		if (start === -1 || end <= start) {
			throw new BadRequestException(
				"AI review response did not contain a JSON object",
			);
		}

		let review: FinalReviewType;
		try {
			review = JSON.parse(raw.slice(start, end + 1)) as FinalReviewType;
		} catch {
			throw new BadRequestException("AI review response was not valid JSON");
		}

		if (
			!review?.diagnosis ||
			typeof review.diagnosis.correct !== "boolean" ||
			typeof review.finalScore !== "number"
		) {
			throw new BadRequestException("AI review response was malformed");
		}

		return review;
	}

	private getSession(sessionId: number) {
		if (!sessionId) {
			throw new BadRequestException("Invalid session");
		}

		const session = this.activeSessions.get(sessionId);

		if (!session) {
			throw new BadRequestException(
				"Unable to load history for this session",
			);
		}

		return session;
	}
}
