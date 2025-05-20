"use client";

import { useState } from "react";
import { InputForm } from "@/app/components/InputForm";
import { DiagramDisplay } from "@/app/components/DiagramDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, BarChart3, AlertTriangle, Info } from "lucide-react";
import type { ProjectData, DiagramContent } from "@/types";

export default function HomePage() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDiagrams = (data: ProjectData) => {
    setIsLoading(true);
    setError(null);
    setProjectData(data); 

    try {
      let mindmapMd = `# ${data.projectName || "My Project"}\n`;
      if (data.projectGoal) mindmapMd += `## Goal: ${data.projectGoal}\n`;

      if (data.mainComponents && data.mainComponents.length > 0) {
        mindmapMd += `### Core Components\n`;
        data.mainComponents.forEach((comp) => (mindmapMd += `  - ${comp.trim()}\n`));
      }
      if (data.stakeholders && data.stakeholders.length > 0) {
        mindmapMd += `### Stakeholders\n`;
        data.stakeholders.forEach((sh) => (mindmapMd += `  - ${sh.trim()}\n`));
      }
      
      if (data.phases && data.phases.length > 0) {
        mindmapMd += `### Project Phases\n`;
        data.phases.forEach((phase) => {
           mindmapMd += `  - ${phase.name} (${phase.startDate} to ${phase.endDate})\n`
        });
      }


      let roadmapMm = "";
      if (data.phases && data.phases.length > 0) {
        roadmapMm = `
gantt
  title ${data.projectName || "Project Roadmap"}
  dateFormat YYYY-MM-DD
  axisFormat %Y-%m-%d
`;
        data.phases.forEach((phase, index) => {
          if (phase.name && phase.startDate && phase.endDate) {
            const taskName = phase.name.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() || `Phase ${index + 1}`;
            const taskId = taskName.replace(/\s+/g, "_").slice(0, 50) || `task_${index}`;
            roadmapMm += `  section ${taskName}\n`;
            // Mermaid Gantt tasks need unique IDs. Appending index for safety.
            roadmapMm += `    ${taskName} :${taskId}_${index}, ${phase.startDate}, ${phase.endDate}\n`;
          }
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Add 1 day
        roadmapMm = `
gantt
  title No Phases Defined
  dateFormat YYYY-MM-DD
  section Empty
    Placeholder Task :ph_task, ${today}, ${tomorrow}
        `;
      }

      setDiagrams({
        mindmapMarkdown: mindmapMd,
        roadmapMermaid: roadmapMm,
      });
    } catch (e: any) {
      setError("Error generating diagram content: " + e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const safeFilenamePrefix = projectData?.projectName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0,50) || "diagram";

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Roadmap Weaver
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Effortlessly craft project mind maps and roadmaps. Input your details and let us visualize your path to success.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2">
          <Card className="shadow-xl h-full">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-accent" />
                Project Information
              </CardTitle>
              <CardDescription>
                Fill in the details below to generate your diagrams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InputForm onSubmit={handleGenerateDiagrams} isLoading={isLoading} />
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-3">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-accent" />
                Generated Diagrams
              </CardTitle>
              <CardDescription>
                Your project's mind map and roadmap will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Error Generating Diagrams</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="p-4 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-900/20 rounded-md flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <p className="text-lg font-medium">Generating diagrams, please wait...</p>
                </div>
              )}
              {!isLoading && !diagrams && !error && (
                <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center min-h-[200px] flex flex-col items-center justify-center">
                  <Info className="h-10 w-10 text-muted-foreground/70 mb-3" />
                  <p className="text-muted-foreground text-lg">
                    Your diagrams will appear here once generated.
                  </p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Fill out the form and click "Generate Diagrams".
                  </p>
                </div>
              )}
              
              {diagrams && (
                <>
                  <div>
                    <DiagramDisplay
                      title="Project Mind Map"
                      type="mindmap"
                      content={diagrams.mindmapMarkdown}
                      filenamePrefix={`${safeFilenamePrefix}_mindmap`}
                    />
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <DiagramDisplay
                      title="Project Roadmap (Gantt Chart)"
                      type="mermaid"
                      content={diagrams.roadmapMermaid}
                      filenamePrefix={`${safeFilenamePrefix}_roadmap`}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
       <footer className="mt-16 py-8 border-t text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Roadmap Weaver. 
          Powered by Next.js, Tailwind CSS, Markmap, and Mermaid.js.
        </p>
      </footer>
    </div>
  );
}
