export interface ProjectPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface ProjectData {
  projectName: string;
  projectGoal: string;
  mainComponents: string[];
  stakeholders: string[];
  phases: ProjectPhase[];
}

export interface DiagramContent {
  mindmapMarkdown: string;
  roadmapMermaid: string;
}

// Added for Pflichtenheft
export interface PflichtenheftSection {
  title: string;
  content: string;
}

export interface PflichtenheftOutput {
  einleitung: PflichtenheftSection;
  ziele: PflichtenheftSection;
  zielgruppen: PflichtenheftSection;
  funktionalitaet: PflichtenheftSection;
  nichtFunktionaleAnforderungen: PflichtenheftSection;
  architektur: PflichtenheftSection;
  projektabschluss: PflichtenheftSection;
  zeitplanung: PflichtenheftSection;
}
