import { Injectable, UnauthorizedException } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { AiService } from "../../core/ai/ai.service";
import { createPatientPrompt } from "../../core/ai/prompts/initial-patient-generation.prompt";
import { DatabaseService } from "../../core/database/database.service";
import { TokenPayloadType } from "../auth/types/token-payload.type";
import { StartSessionDto } from "./dto/start-session.dto";
import { SessionStatusEnum } from "./enums/session-status.enum";
import { PatientVitalsType } from "./types/patient-vitals.type";

@Injectable()
export class ChatService {
	private readonly xmlParser = new XMLParser();

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

			const aiResponse = await this.aiService.generate(prompt);
			const patientData: { message: string; vitals: string } =
				this.xmlParser.parse(aiResponse.response);

			const outputMessage = patientData.message;
			const vitals: PatientVitalsType = JSON.parse(
				patientData.vitals.replace("\n", ""),
			);

			client.data.sessionStartTime = sessionStartTime;
			client.emit("session_started", { message: outputMessage, vitals });

			const { id } = await this.databaseService.sessions.create({
				data: {
					user_id: userId,
					specialty: specialty,
					patient_problem: vitals.condition,
					status,
				},
				select: {
					id: true,
				},
			});

			client.data.sessionId = id;
		} catch (error) {
			client.emit("chat:error", { message: error });
			throw error;
		}
	}

	handleDisconnect(client: Socket) {
		console.log(`The client with id: ${client.id} disconnected`);
		// End of the chat here. After this step,
		// The analyzation part is executed
	}

	async handleMessage(client: Socket, message: string) {
		try {
			const _aiResponseStream = await this.aiService.generate(message);

			// for await (const part of aiResponseStream) {
			// 	client.emit("chat:chunk", { chunk: part.response });
			// 	 if (!client.connected) break;
			// }

			client.emit("chat:done", { done: true });
		} catch (error) {
			client.emit("chat:error", { message: error });
			throw error;
		}
	}
}
