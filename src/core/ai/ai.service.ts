import { Injectable } from "@nestjs/common";
import { Ollama } from "ollama";

@Injectable()
export class AiService {
	private readonly ollama: Ollama;
	private readonly HOST_URL = "https://ollama.com";
	private readonly model = "gemma3:12b";

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
}
