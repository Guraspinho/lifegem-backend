import { Injectable, Logger } from "@nestjs/common";
import { GenerateResponse, Ollama } from "ollama";

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);
	private readonly ollama: Ollama;
	private readonly HOST_URL = "https://ollama.com";
	private readonly model = "gemma3:12b";
	private static readonly MAX_RETRIES = 2;

	constructor() {
		if (process.env.USE_OLLAMA_CLOUD === "true") {
			this.ollama = new Ollama({
				host: this.HOST_URL,
				headers: {
					Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
				},
			});
		} else {
			this.ollama = new Ollama();
		}
	}

	async generate(prompt: string) {
		return await this.ollama.generate({
			model: this.model,
			think: false,
			prompt,
			stream: false,
			options: {
				temperature: 0.9,
				seed: Math.floor(Math.random() * 100000),
			},
		});
	}

	async generateValidated<T>(
		prompt: string,
		parse: (response: GenerateResponse) => T,
	): Promise<T> {
		const maxAttempts = AiService.MAX_RETRIES + 1;
		let lastError: unknown;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			const response = await this.generate(prompt);

			try {
				return parse(response);
			} catch (error) {
				lastError = error;
			}
		}

		throw lastError;
	}
}
