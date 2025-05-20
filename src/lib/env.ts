/**
 * Environment variable utility
 * For safely accessing environment variables with validation
 */

export const env = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "",

  // App Configuration
  defaultLanguage: (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de") as
    | "de"
    | "en",

  // AI Service (for Pflichtenheft generation)
  aiServiceKey: process.env.AI_SERVICE_API_KEY || "",
  aiServiceEndpoint:
    process.env.AI_SERVICE_ENDPOINT || "https://ai-service.example.com/api",

  /**
   * Check if all required API environment variables are set
   */
  isApiConfigured: () => {
    return Boolean(
      process.env.NEXT_PUBLIC_API_KEY && process.env.NEXT_PUBLIC_API_URL
    );
  },

  /**
   * Check if AI service environment variables are set
   */
  isAiServiceConfigured: () => {
    return Boolean(
      process.env.AI_SERVICE_API_KEY && process.env.AI_SERVICE_ENDPOINT
    );
  },
};
