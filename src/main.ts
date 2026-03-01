import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { swaggerConfig } from "./core/swagger/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api-docs", app, swaggerDocument);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
