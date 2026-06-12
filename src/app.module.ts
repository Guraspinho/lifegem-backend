import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./core/ai/ai.module";
import { DatabaseModule } from "./core/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { HealthCheckModule } from "./modules/health-check/health-check.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		HealthCheckModule,
		AuthModule,
		ChatModule,
		UserModule,
		AiModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
