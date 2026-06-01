import { UseFilters, UseGuards, UsePipes } from "@nestjs/common";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsExceptionFilter } from "../../common/filters/ws-exception.filter";
import { WsAuthGuard } from "../../common/guards/ws-auth.guard";
import { WsValidationPipe } from "../../common/pipes/ws-validation.pipe";
import { ChatService } from "./chat.service";
import { StartSessionDto } from "./dto/start-session.dto";

@WebSocketGateway()
@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
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
	@SubscribeMessage("start_session")
	async handleStartSsession(
		client: Socket,
		message: StartSessionDto,
	): Promise<void> {
		await this.chatService.handleStartSession(client, message);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("chat_message")
	handleMessage(client: Socket, message: string): void {
		this.chatService.handleMessage(client, message);
		const room = client.data.user.sub;

		this.server.to(room).emit("message", {
			room,
			message,
		});
	}
}
