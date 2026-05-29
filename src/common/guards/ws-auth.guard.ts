import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export class WsAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const client: Socket = context.switchToWs().getClient();
		return !!client.data.user;
	}
}
