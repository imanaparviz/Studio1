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
