
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure you have a .env.local file in your project root with:
// GOOGLE_API_KEY=YOUR_API_KEY

if (!process.env.GOOGLE_API_KEY) {
  console.warn(
    'GOOGLE_API_KEY is not set in the environment. Genkit calls may fail.'
  );
  // Optionally, throw an error if the key is absolutely required for the app to start
  // throw new Error('GOOGLE_API_KEY is not set. Please set it in your .env.local file.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Use the API key from environment variable
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model, can be overridden in specific calls
});
