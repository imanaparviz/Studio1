import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { env } from "@/lib/env";

// Get API key from environment variables - ensure this only runs server-side
let GOOGLE_API_KEY: string | undefined;

// Only access environment variables in server context
if (typeof window === "undefined") {
  GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || env.aiServiceKey;

  if (!GOOGLE_API_KEY) {
    console.warn(
      "GOOGLE_AI_API_KEY is not set. AI features will not work properly."
    );
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GOOGLE_API_KEY || "",
    }),
  ],
  model: "googleai/gemini-2.0-flash", // Default model, can be overridden in specific calls
});
