// Configuration for LM Studio and other settings
export const config = {
  lmStudio: {
    baseURL: process.env.LM_STUDIO_BASE_URL || "http://localhost:1234/v1",
    apiKey: "lm-studio", // LM Studio doesn't require a real API key
    model: process.env.LM_STUDIO_MODEL || "qwen/qwen3-1.7b",
  },
};
