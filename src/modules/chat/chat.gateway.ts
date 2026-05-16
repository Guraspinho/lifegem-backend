import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class ChatGatweay implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket): void {
		this.server.emit("room", client.id + " joined!");
	}

	handleDisconnect(client: Socket): void {
		this.server.emit("room", client.id + " left!");
	}

	@SubscribeMessage("customName")
	handleMessage(client: Socket, message: any): void {
		this.server.emit("room", `[${client.id}] -> ${message}`);
	}
}
