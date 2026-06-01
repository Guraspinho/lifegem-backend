export type HttpExceptionHandlerType = {
	statusCode: number;
	timestamp: string;
	path: string;
	error: string | object;
};
