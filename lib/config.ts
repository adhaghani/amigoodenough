// Configuration for OpenRouter and other settings
export const config = {
  openRouter: {
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
  },
};
