import { Module } from "@nestjs/common";
import { ChatGatweay } from "./chat.gateway";

@Module({
	providers: [ChatGatweay],
})
export class ChatModule {}
