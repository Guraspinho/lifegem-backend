import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { DatabaseProvider } from "./providers/database.provider";

@Global()
@Module({
	providers: [DatabaseProvider],
	exports: [DatabaseService],
})
export class DatabaseModule {}
