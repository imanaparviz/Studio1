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

  // Wir haben den API-Schlüssel direkt in genkit.ts gesetzt, diese Prüfung können wir überspringen
  // und stattdessen direkt den Flow ausführen
  try {
    console.log("Starte Generierung des Pflichtenhefts mit API-Schlüssel...");
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
  prompt: `Du bist ein Experte für Projektmanagement und Anforderungsanalyse und erstellst ein detailliertes Pflichtenheft (Software Requirements Specification) für ein neues Softwareprojekt.

WICHTIG: Die Ausgabe MUSS in Deutsch sein und dem vorgegebenen JSON-Schema entsprechen.

PROJEKTINFORMATIONEN:
Projektname: {{{projectName}}}
Projektziel: {{{projectGoal}}}
Hauptkomponenten: {{#if mainComponents.length}}{{#each mainComponents}}- {{{this}}}{{/each}}{{else}}Nicht angegeben{{/if}}
Stakeholder: {{#if stakeholders.length}}{{#each stakeholders}}- {{{this}}}{{/each}}{{else}}Nicht angegeben{{/if}}
Projektphasen:
{{#if phases.length}}
{{#each phases}}
  - Phase: {{{name}}} (von {{{startDate}}} bis {{{endDate}}})
{{/each}}
{{else}}
Nicht angegeben
{{/if}}

ANFORDERUNGEN AN DIE AUSGABE:
- Erstelle für JEDEN der folgenden Abschnitte einen Eintrag im JSON-Format mit 'title' und 'content'
- Die Inhalte müssen detailliert, professionell und praxistauglich sein
- Verwende Markdown zur Formatierung des 'content'-Feldes
- Alle Antworten MÜSSEN in deutscher Sprache sein

ABSCHNITTE DES PFLICHTENHEFTS:

1. einleitung: 
   - Titel des Projekts
   - Projektziel
   - Auftraggeber/Auftragnehmer (wenn ableitbar)

2. ziele:
   - SMART-Ziele (Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert)
   - Explizite Nicht-Ziele

3. zielgruppen:
   - Wer sind die Zielgruppen/User?
   - Wo wird das Produkt eingesetzt?
   - Welche Bedürfnisse haben die Nutzer?

4. funktionalitaet:
   - Welche Module und Funktionen soll das Produkt haben?
   - Funktionale Anforderungen basierend auf den angegebenen Hauptkomponenten
   - Typische Module wie Login, Bezahlsystem, Userverwaltung, DB-Interaktionen

5. nichtFunktionaleAnforderungen:
   - Serveranforderungen, Performance-Ziele
   - Sicherheitsaspekte, Datenschutz
   - Usability, Wartbarkeit
   - Schnittstellen zu anderen Systemen

6. architektur:
   - Systemarchitektur im Überblick
   - Module und ihre Interaktionen
   - Eingesetzte Technologien (DB, Programmiersprachen, Frameworks)

7. projektabschluss:
   - Abnahmekriterien
   - Lieferumfang
   - Teststrategie (Unit Tests, Integrationstests, Abnahmetests)

8. zeitplanung:
   - Meilensteine basierend auf den angegebenen Phasen
   - Zeitplan und Abhängigkeiten zwischen Aufgaben

AUSGABEFORMAT (JSON):
{
  "einleitung": {
    "title": "Einleitung",
    "content": "### Titel\\n{{{projectName}}}\\n\\n### Projektziel\\n{{{projectGoal}}}\\n\\n### Auftraggeber/Auftragnehmer\\n[Details zum Auftraggeber und Auftragnehmer, falls bekannt]"
  },
  "ziele": {
    "title": "Ziele",
    "content": "### Ziele\\n- [Spezifisches Ziel 1]\\n- [Spezifisches Ziel 2]\\n\\n### Nicht-Ziele\\n- [Nicht-Ziel 1]\\n- [Nicht-Ziel 2]"
  },
  // ... weitere Abschnitte analog formatiert
}

Stelle sicher, dass alle 8 Abschnitte vollständig ausgefüllt sind und sinnvolle Inhalte enthalten.
`,
});

const generatePflichtenheftFlow = ai.defineFlow(
  {
    name: "generatePflichtenheftFlow",
    inputSchema: ProjectDataSchema,
    outputSchema: PflichtenheftOutputSchema,
  },
  async (input) => {
    try {
      // API key is already configured in the genkit.ts file
      // and only accessed server-side
      const { output } = await prompt(input);

      if (!output) {
        console.error("AI returned null or undefined output");
        throw new Error(
          "AI did not return an output for Pflichtenheft generation."
        );
      }

      console.log("AI returned output structure:", Object.keys(output));

      // Ensure all required sections exist
      const requiredSections = [
        "einleitung",
        "ziele",
        "zielgruppen",
        "funktionalitaet",
        "nichtFunktionaleAnforderungen",
        "architektur",
        "projektabschluss",
        "zeitplanung",
      ];

      for (const section of requiredSections) {
        if (!output[section]) {
          console.error(`Missing required section in output: ${section}`);
          output[section] = {
            title:
              section === "einleitung"
                ? "Einleitung"
                : section === "ziele"
                ? "Ziele"
                : section === "zielgruppen"
                ? "Zielgruppen/User"
                : section === "funktionalitaet"
                ? "Funktionalität"
                : section === "nichtFunktionaleAnforderungen"
                ? "Nicht funktionale Anforderungen"
                : section === "architektur"
                ? "Architektur"
                : section === "projektabschluss"
                ? "Projektabschluss"
                : section === "zeitplanung"
                ? "Zeitplanung"
                : "Fehlt",
            content: `Diese Sektion wurde vom AI-Dienst nicht korrekt generiert. Bitte überprüfen Sie die API-Konfiguration.`,
          };
        }
      }

      return output;
    } catch (error) {
      console.error("Error in generatePflichtenheftFlow:", error);
      throw error;
    }
  }
);
