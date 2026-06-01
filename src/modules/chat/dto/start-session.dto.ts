import { IsEnum, IsNotEmpty } from "class-validator";
import { SessionSpecialtyEnum } from "../enums/session-specialty.enum";

export class StartSessionDto {
	@IsNotEmpty()
	@IsEnum(SessionSpecialtyEnum)
	specialty: SessionSpecialtyEnum;
}
