import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { env } from "@/lib/env";

// Get API key from environment variables - ensure this only runs server-side
let GOOGLE_API_KEY: string | undefined;

// Only access environment variables in server context
if (typeof window === "undefined") {
  // SICHERHEIT: Erstelle eine .env.local Datei im Stammverzeichnis mit:
  // GOOGLE_AI_API_KEY=dein_api_schlüssel
  // Wichtig: Füge .env.local zur .gitignore Datei hinzu, falls noch nicht geschehen!

  // Versuche den Schlüssel aus verschiedenen Quellen zu holen
  GOOGLE_API_KEY =
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env.aiServiceKey;

  // Prüfe ob der Schlüssel verfügbar ist
  if (!GOOGLE_API_KEY) {
    console.warn(
      "GOOGLE_AI_API_KEY is not set. AI features will not work properly."
    );
    // Temporärer Fallback für Entwicklungszwecke
    // WICHTIG: Diese Zeile vor dem Produktionseinsatz oder Git-Push entfernen!
    GOOGLE_API_KEY = "AIzaSyCk814Ok0MOa_C9_u2FiJx5WX_spaHoeUQ";
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
