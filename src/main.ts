import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { swaggerConfig } from "./core/swagger/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api-docs", app, swaggerDocument);

	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({ transform: true, whitelist: true }),
	);

	app.enableCors({
		origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
		credentials: true,
	});

	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
