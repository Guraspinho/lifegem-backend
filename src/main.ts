import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { swaggerConfig } from "./core/swagger/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api-docs", app, swaggerDocument);

	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({ transform: true, whitelist: true }),
	);

	app.enableCors({
		origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
		credentials: true,
	});

	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 3000, "0.0.0.0");

	const logger = new Logger("Bootstrap");

	if (process.env.USE_OLLAMA_CLOUD === "true") {
		logger.log("The app is using Ollama cloud ");
	} else {
		logger.log("The app is using Ollama local");
	}
}
bootstrap();
