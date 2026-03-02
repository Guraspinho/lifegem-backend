import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../../../generated/prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleDestroy {
	async onModuleDestroy() {
		await this.$disconnect();
	}
}
