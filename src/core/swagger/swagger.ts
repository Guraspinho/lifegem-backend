import { DocumentBuilder } from "@nestjs/swagger";
export const swaggerConfig = new DocumentBuilder()
	.setTitle("LifeGem Backend")
	.setVersion("1.0")
	.addTag("lifegem-backend")
	.addBearerAuth()
	.build();
