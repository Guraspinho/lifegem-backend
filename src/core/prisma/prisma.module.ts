import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { PrismaProvider } from "./providers/prisma.provider";

@Global()
@Module({
	providers: [PrismaProvider],
	exports: [PrismaService],
})
export class PrismaModule {}
