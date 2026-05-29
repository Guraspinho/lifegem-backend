import { UseGuards } from "@nestjs/common";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsAuthGuard } from "../../common/guards/ws-auth.guard";
import { ChatService } from "./chat.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) {}

	handleConnection(client: Socket): void {
		this.chatService.handleConnection(client);
	}

	handleDisconnect(client: Socket): void {
		this.chatService.handleDisconnect(client);
		this.server.emit("room", client.id + " left!");
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("message")
	handleMessage(client: Socket, message: string): void {
		this.chatService.handleMessage(client, message);
		const room = client.data.user.sub;

		this.server.to(room).emit("message", {
			room,
			message,
		});
	}
}
