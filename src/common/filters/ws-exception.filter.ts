import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
	private readonly logger = new Logger(WsException.name);

	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient<Socket>();
		this.logger.error({
			timestamp: new Date().toISOString(),
			clientId: client.id,
			error: exception,
		});

		client.emit("error", {
			message: exception.getError(),
		});
	}
}
