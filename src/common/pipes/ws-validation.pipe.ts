import { Injectable, ValidationError, ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsValidationPipe extends ValidationPipe {
	createExceptionFactory() {
		return (validationErrors: ValidationError[] = []) => {
			const errors = this.flattenValidationErrors(validationErrors);
			throw new WsException(errors);
		};
	}
}
