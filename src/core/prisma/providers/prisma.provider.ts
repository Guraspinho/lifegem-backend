import { Logger, Provider } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaService } from "../prisma.service";

export const PrismaProvider: Provider = {
	provide: PrismaService,
	useFactory: async () => {
		const logger = new Logger("PrismaProvider");

		const client = new PrismaService({
			adapter: new PrismaPg({
				connectionString: process.env.DATABASE_URL,
			}),
		});

		try {
			await client.$connect();
			logger.log("Database connection was successfull...");
			return client;
		} catch (error) {
			logger.error(
				"CRITICAL: Failed to connect to the database. Halting startup.",
				error,
			);
			process.exit(1);
		}
	},
};
