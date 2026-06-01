import { Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { DatabaseService } from "../../core/database/database.service";
import { TokenPayloadType } from "../auth/types/token-payload.type";
import { StartSessionDto } from "./dto/start-session.dto";
import { SessionStatusEnum } from "./enums/session-status.enum";

@Injectable()
export class ChatService {
	constructor(private readonly databaseService: DatabaseService) {}

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
		const userId = client.data.user.sub;
		const { specialty } = message;
		const status = SessionStatusEnum.ACTIVE;
		const sessionStartTime = new Date();
		const patientProblem = "SOME RANDOM PROBLEM";

		client.data.sessionStartTime = sessionStartTime;

		const { id } = await this.databaseService.sessions.create({
			data: {
				user_id: userId,
				specialty: specialty,
				patient_problem: patientProblem,
				status,
			},
			select: {
				id: true,
			},
		});

		client.data.sessionId = id;
	}

	handleDisconnect(client: Socket) {
		console.log(`The client with id: ${client.id} disconnected`);
		// End of the chat here. After this step,
		// The analyzation part is executed
	}

	handleMessage(client: Socket, message: string) {
		// System evaluation right here.
		console.log(`CLIENT ID: ${client.id}. MESSAGE: ${message}`);
	}
}
