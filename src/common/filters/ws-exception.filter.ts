	import { ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common";
	import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
	import { Socket } from "socket.io";

	@Catch()
	export class WsExceptionFilter extends BaseWsExceptionFilter {
		private readonly logger = new Logger(WsExceptionFilter.name);

		catch(exception: unknown, host: ArgumentsHost): void {
			const client = host.switchToWs().getClient<Socket>();

			this.logger.error({
				timestamp: new Date().toISOString(),
				clientId: client?.id,
				error: exception instanceof Error ? exception.stack : exception,
			});

			if (client?.connected) {
				client.emit("error", { message: this.toClientMessage(exception) });
			}
		}

		private toClientMessage(exception: unknown): string | object {
			if (exception instanceof WsException) {
				return exception.getError();
			}

			if (exception instanceof HttpException) {
				return exception.getResponse();
			}

			return "Internal server error";
		}
	}
