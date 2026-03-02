import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./core/database/database.module";
import { HealthCheckModule } from "./modules/health-check/health-check.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		HealthCheckModule,
		UsersModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
