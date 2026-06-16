import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
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
import { PatientInitialInfoType } from "./types/patient-info.type";
import { PatientVitalsType } from "./types/patient-vitals.type";
import { SessionHistoryType } from "./types/session-history.type";

@Injectable()
export class ChatService {
	private readonly xmlParser = new XMLParser();
	private activeSessions = new Map<number, SessionHistoryType>();

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly aiService: AiService,
	) {}

	handleConnection(client: Socket) {
		const token = client.handshake.query.auth;

		if (typeof token !== "string") {
			throw new UnauthorizedException("Invalid token format");
		}

		if (!token) {
			client.emit("error", "No token provided");
			client.disconnect();
			throw new UnauthorizedException("Invalid or missing auth token");
		}
		try {
			const payload = jwt.verify(
				token,
				process.env.ACCESS_TOKEN_SECRET as string,
			) as TokenPayloadType;

			if (!payload.sub) {
				throw new UnauthorizedException();
			}

			client.data.user = payload;
			const room = payload.sub.toString();
			client.join(room);
		} catch (error) {
			console.error(error);
			client.emit("error", "Invalid or expired token");
			client.disconnect();
			return;
		}
	}

	async handleStartSession(
		client: Socket,
		message: StartSessionDto,
	): Promise<void> {
		try {
			const userId = client.data.user.sub;
			const { specialty } = message;

			const status = SessionStatusEnum.ACTIVE;
			const sessionStartTime = new Date();
			const prompt = createPatientPrompt(specialty);

			const { outputMessage, patient } =
				this.parseAiResponse<PatientInitialInfoType>(
					await this.aiService.generate(prompt),
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

			client.data.sessionStartTime = sessionStartTime;
			client.emit("session:start", { message: outputMessage, patient });

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

			client.data.sessionId = id;

			await this.databaseService.users.update({
				where: { id: userId },
				data: { completed_simulations: { increment: 1 } },
			});
		} catch (error) {
			client.emit("chat:error", { message: error });
			throw error;
		}
	}

	async handleChatMessage(client: Socket, message: string) {
		try {
			const { sessionId } = client.data;

			const session = this.getSession(sessionId);
			const prompt = generateActiveChatPrompt(session, message);

			const { outputMessage, patient: vitals } =
				this.parseAiResponse<PatientVitalsType>(
					await this.aiService.generate(prompt),
				);

			session.sessionHistory.push({
				userMessage: message,
				systemMessage: outputMessage,
				vitals,
			});

			this.activeSessions.set(sessionId, session);

			client.emit("message:done", { outputMessage, patient: vitals });
		} catch (error) {
			client.emit("chat:error", { message: error });
			throw error;
		}
	}

	handleFinalDiagnosis(client: Socket, message: string) {
		try {
			const { sessionId } = client.data;

			const session = this.getSession(sessionId);
			session.finalDiagnosis = message;
		} catch (error) {
			client.emit("chat:error", { message: error });
			throw error;
		}
	}

	async handleSessionEnd(client: Socket) {
		try {
			const { sessionId } = client.data;
			const session = this.getSession(sessionId);
			const history = session.sessionHistory;

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
			const aiResponse = await this.aiService.generate(prompt);

			const response = await this.databaseService.sessions.update({
				where: { id: sessionId },
				data: {
					correct_diagnosis: true, // ai will tell us this
					systemAnalysis: aiResponse.response,
					score: finalScore,
					status: SessionStatusEnum.COMPLETED,
					duration_seconds: sessionDuration,
					final_diagnosis: session.finalDiagnosis,
					patient_survived:
						patientSurvivalStatus === "deceased" ? false : true,
					history,
				},
				select: {
					correct_diagnosis: true,
					score: true,
					status: true,
					duration_seconds: true,
					final_diagnosis: true,
					patient_survived: true,
					systemAnalysis: true,
				},
			});

			client.emit("session:end", { response, scores });
			console.log(response);
		} catch (error) {
			console.log(`The client with id: ${client.id} disconnected`);
		}
	}

	async handleDisconnect(client: Socket) {
		try {
		} catch (error) {
			client.emit("chat:error", { message: error });
		}

		console.log(`The client with id: ${client.id} disconnected`);
	}

	handleError() {
		// The error will be handled here.
	}

	private parseAiResponse<T>(aiResponse: GenerateResponse): {
		outputMessage: string;
		patient: T;
	} {
		const patientData: { message: string; vitals: string } =
			this.xmlParser.parse(aiResponse.response);

		const outputMessage = patientData.message;
		const patient: T = JSON.parse(patientData.vitals.replace("\n", ""));

		return { outputMessage, patient };
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
