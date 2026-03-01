import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./core/prisma/prisma.module";
import { HealthCheckModule } from "./modules/health-check/health-check.module";

@Module({
	imports: [ConfigModule.forRoot(), PrismaModule, HealthCheckModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
