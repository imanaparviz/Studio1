"use server";
/**
 * @fileOverview A Pflichtenheft (Software Requirements Specification) generation AI agent.
 *
 * - generatePflichtenheft - A function that handles the Pflichtenheft generation process.
 * - ProjectDataForAI - The input type for the generatePflichtenheft function (maps to ProjectData).
 * - PflichtenheftOutput - The return type for the generatePflichtenheft function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import type {
  ProjectData,
  PflichtenheftOutput as PflichtenheftOutputType,
} from "@/types";
import { env } from "@/lib/env";

// Schema for ProjectData input
const ProjectPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const ProjectDataSchema = z.object({
  projectName: z.string().describe("The name of the project."),
  projectGoal: z.string().describe("The overall goal of the project."),
  mainComponents: z
    .array(z.string())
    .describe("List of main software components or modules."),
  stakeholders: z
    .array(z.string())
    .describe("List of key stakeholders involved in the project."),
  phases: z
    .array(ProjectPhaseSchema)
    .describe("List of project phases with their start and end dates."),
});
export type ProjectDataForAI = z.infer<typeof ProjectDataSchema>;

// Schema for Pflichtenheft output
const PflichtenheftSectionSchema = z.object({
  title: z.string().describe("The title of this section of the Pflichtenheft."),
  content: z
    .string()
    .describe(
      "The detailed content for this section, formatted as Markdown. Be comprehensive and professional."
    ),
});

const PflichtenheftOutputSchema = z.object({
  einleitung: PflichtenheftSectionSchema.describe(
    "Einleitung (Introduction): Project title, overall project goal, client/contractor if inferable."
  ),
  ziele: PflichtenheftSectionSchema.describe(
    "Ziele (Goals): Specific, measurable, achievable, relevant, and time-bound (SMART) goals, and explicit non-goals."
  ),
  zielgruppen: PflichtenheftSectionSchema.describe(
    "Zielgruppen/User (Target Groups/Users): Detailed description of target users, their needs, and the context/environment where the product will be used."
  ),
  funktionalitaet: PflichtenheftSectionSchema.describe(
    "Funktionalität (Functionality - Was): Key functional requirements, detailing what the system will do. Expand on provided main components with specific functionalities. Example modules: Login, Payment System, User Management, Database interactions, etc."
  ),
  nichtFunktionaleAnforderungen: PflichtenheftSectionSchema.describe(
    "Nicht funktionale Anforderungen (Non-functional Requirements): Aspects like performance (response times, scalability), security (data protection, access control), usability, reliability, maintainability, SEO, interfaces to other systems, etc."
  ),
  architektur: PflichtenheftSectionSchema.describe(
    "Architektur (Architecture): High-level overview of the system architecture, key modules and their interactions, technologies to be used (programming languages, frameworks, databases)."
  ),
  projektabschluss: PflichtenheftSectionSchema.describe(
    "Projektabschluss (Project Completion): Criteria for project completion, deliverables, acceptance criteria by the client, and a basic testing strategy (unit tests, integration tests, user acceptance tests)."
  ),
  zeitplanung: PflichtenheftSectionSchema.describe(
    "Zeitplanung (Timeline): Summary of the project timeline based on the provided phases, identification of key milestones, and dependencies between tasks/phases if inferable."
  ),
});
export type PflichtenheftOutput = PflichtenheftOutputType; // Use the existing type from @/types

export async function generatePflichtenheft(
  input: ProjectData
): Promise<PflichtenheftOutput> {
  // Server-side environment check
  if (typeof window !== "undefined") {
    console.warn("Pflichtenheft generation should only be called server-side.");
    return createFallbackPflichtenheft(input);
  }

  // Check if Google AI API key is configured
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn(
      "Google AI API key is not properly configured. Check environment variables."
    );
    // Return a fallback response or handle the error appropriately
    return createFallbackPflichtenheft(input);
  }

  try {
    // Map ProjectData to ProjectDataForAI if necessary, here they are compatible
    return await generatePflichtenheftFlow(input as ProjectDataForAI);
  } catch (error) {
    console.error("Error generating Pflichtenheft:", error);
    return createFallbackPflichtenheft(input);
  }
}

/**
 * Creates a fallback Pflichtenheft when AI generation fails or API isn't configured
 */
function createFallbackPflichtenheft(input: ProjectData): PflichtenheftOutput {
  const { projectName, projectGoal } = input;

  return {
    einleitung: {
      title: "Einleitung",
      content: `### Titel\n${
        projectName || "Unbenanntes Projekt"
      }\n\n### Projektziel\n${
        projectGoal || "Kein Ziel definiert."
      }\n\n### Hinweis\nDieses Pflichtenheft wurde automatisch generiert. Für ein detaillierteres Pflichtenheft, stellen Sie sicher, dass die AI-Service-Konfiguration korrekt ist.`,
    },
    ziele: {
      title: "Ziele",
      content:
        "Keine Ziele definiert. Bitte vervollständigen Sie diese Sektion manuell.",
    },
    zielgruppen: {
      title: "Zielgruppen/User",
      content:
        "Keine Zielgruppen definiert. Bitte vervollständigen Sie diese Sektion manuell.",
    },
    funktionalitaet: {
      title: "Funktionalität",
      content: `### Hauptkomponenten\n${
        input.mainComponents?.map((comp) => `- ${comp}`).join("\n") ||
        "Keine Hauptkomponenten definiert."
      }`,
    },
    nichtFunktionaleAnforderungen: {
      title: "Nicht funktionale Anforderungen",
      content:
        "Keine nicht-funktionalen Anforderungen definiert. Bitte vervollständigen Sie diese Sektion manuell.",
    },
    architektur: {
      title: "Architektur",
      content:
        "Keine Architekturinformationen verfügbar. Bitte vervollständigen Sie diese Sektion manuell.",
    },
    projektabschluss: {
      title: "Projektabschluss",
      content:
        "Keine Kriterien für den Projektabschluss definiert. Bitte vervollständigen Sie diese Sektion manuell.",
    },
    zeitplanung: {
      title: "Zeitplanung",
      content: `### Projektphasen\n${
        input.phases
          ?.map(
            (phase) =>
              `- **${phase.name}**: ${phase.startDate} bis ${phase.endDate}`
          )
          .join("\n") || "Keine Projektphasen definiert."
      }`,
    },
  };
}

const prompt = ai.definePrompt({
  name: "pflichtenheftPrompt",
  input: { schema: ProjectDataSchema },
  output: { schema: PflichtenheftOutputSchema },
  prompt: `You are an expert project manager and business analyst tasked with drafting a "Pflichtenheft" (Software Requirements Specification) for a new software project.
Your output must be in German.

Based on the following project information provided by the user:
Project Name: {{{projectName}}}
Project Goal: {{{projectGoal}}}
Main Components: {{#if mainComponents.length}}{{#each mainComponents}}- {{{this}}}{{/each}}{{else}}Not specified{{/if}}
Stakeholders: {{#if stakeholders.length}}{{#each stakeholders}}- {{{this}}}{{/each}}{{else}}Not specified{{/if}}
Project Phases:
{{#if phases.length}}
{{#each phases}}
  - Phase: {{{name}}} ({{{startDate}}} to {{{endDate}}})
{{/each}}
{{else}}
Not specified
{{/if}}

Please generate the content for all sections of the Pflichtenheft as defined in the output schema.
Be comprehensive, professional, and practical. Use Markdown for formatting the 'content' field of each section.
Refer to the following structure for guidance on what to include in each section:

- Einleitung: Titel des Projekts, Projektziel, ggf. Auftraggeber/Auftragnehmer.
- Ziele: Definierte Ziele und Nicht-Ziele des Projekts.
- Zielgruppen/User: Wer sind die Zielgruppen/User? Wo wird das Produkt eingesetzt?
- Funktionalität (Was): Welche Module und Funktionen soll das Produkt haben (z.B. Login, Bezahlsystem, Userverwaltung, DB-Interaktionen)? Leite dies aus den gegebenen Projektinformationen ab und ergänze typische Funktionen.
- Nicht funktionale Anforderungen: Serveranforderungen, Performance-Ziele, Sicherheitsaspekte, SEO (falls relevant), Schnittstellen zu anderen Systemen, Benutzbarkeit, Wartbarkeit.
- Architektur: Grobe Beschreibung der Systemarchitektur, Module und Technologien (DB, Programmiersprachen, Frameworks).
- Projektabschluss: Wann ist das Projekt abgeschlossen? Welche Kriterien müssen erfüllt sein? Wie wird getestet?
- Zeitplanung: Wichtige Meilensteine und Zeitplan basierend auf den Projektphasen.

Ensure your response strictly adheres to the JSON output schema, providing a 'title' (in German, matching the schema key description) and Markdown 'content' for each section.
Example for a section:
"einleitung": {
  "title": "Einleitung",
  "content": "### Titel\n{{{projectName}}}\n\n### Projektziel\n{{{projectGoal}}}\n\n### Auftraggeber/Auftragnehmer\n[Details zum Auftraggeber und Auftragnehmer, falls bekannt oder Standardtext einfügen]"
}
Fill all sections with meaningful content.
`,
});

const generatePflichtenheftFlow = ai.defineFlow(
  {
    name: "generatePflichtenheftFlow",
    inputSchema: ProjectDataSchema,
    outputSchema: PflichtenheftOutputSchema,
  },
  async (input) => {
    // API key is already configured in the genkit.ts file
    // and only accessed server-side
    const { output } = await prompt(input);

    if (!output) {
      throw new Error(
        "AI did not return an output for Pflichtenheft generation."
      );
    }

    return output;
  }
);
