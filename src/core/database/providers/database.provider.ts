import { Logger, Provider } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { DatabaseService } from "../database.service";

export const DatabaseProvider: Provider = {
	provide: DatabaseService,
	useFactory: async () => {
		const logger = new Logger("DatabaseProvider");

		const client = new DatabaseService({
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
