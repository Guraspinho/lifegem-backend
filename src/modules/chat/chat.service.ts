import { Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { TokenPayloadType } from "../auth/types/token-payload.type";

@Injectable()
export class ChatService {
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

	handleDisconnect(client: Socket) {
		console.log(client.id);
		// End of the chat here. After this step,
		// The analyzation part is executed
	}

	handleMessage(client: Socket, message: string) {
		// System evaluation right here.
		console.log(`CLIENT ID: ${client.id}. MESSAGE: ${message}`);
	}
}
