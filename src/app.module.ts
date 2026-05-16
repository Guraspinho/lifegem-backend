import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./core/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { HealthCheckModule } from "./modules/health-check/health-check.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		HealthCheckModule,
		AuthModule,
		ChatModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
