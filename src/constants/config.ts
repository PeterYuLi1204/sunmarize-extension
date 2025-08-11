import { ModelConfig } from "./interfaces.js";
import { OPENAI_API_KEY, GEMINI_API_KEY } from "./secrets.js";

export const PROMPT =
  "Summarize the following text into 1 to 8 main points, using one point per idea. Each point should be short and clear. Prioritize accuracy and relevance. Exclude any references to the news outlet, author, or unrelated stories. Format each point as a full sentence separated by semicolons. Example: 'Climate change impacts coastal cities;New policy aims to reduce emissions by 2030;Scientists urge immediate action'";

export enum ModelOption {
  OPENAI = "openai",
  GEMINI = "gemini",
}

export const MODEL_CONFIGS: Record<ModelOption, ModelConfig> = {
  [ModelOption.OPENAI]: {
    apiURL: "https://api.openai.com/v1/chat/completions",
    model: "gpt-5-nano",
    apiKey: OPENAI_API_KEY,
  },
  [ModelOption.GEMINI]: {
    apiURL: "https://generativelanguage.googleapis.com/v1beta:chatCompletions",
    model: "gemini-2.5-flash-lite",
    apiKey: GEMINI_API_KEY,
  },
};
