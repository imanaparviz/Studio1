import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { env } from "@/lib/env";

// Get API key from environment variables - ensure this only runs server-side
let GOOGLE_API_KEY: string | undefined;

// Only access environment variables in server context
if (typeof window === "undefined") {
  // Direkt eingegebener API-Schlüssel (nur für Testzwecke)
  GOOGLE_API_KEY = "AIzaSyCk814Ok0MOa_C9_u2FiJx5WX_spaHoeUQ";

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
  // Verwende gemini-2.0-flash mit niedrigeren Quotas aber neuerer Version
  model: "googleai/gemini-2.0-flash",
});
