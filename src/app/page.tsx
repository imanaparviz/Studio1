"use client";

import { useState } from "react";
import { InputForm } from "@/app/components/InputForm";
import { EnhancedMindmap } from "@/app/components/EnhancedMindmap";
import { EnhancedGanttChart } from "@/app/components/EnhancedGanttChart";
import { useLanguage } from "@/app/providers/LanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Lightbulb,
  BarChart3,
  AlertTriangle,
  Info,
  BookText,
  Loader2 as PageLoaderIcon,
} from "lucide-react";
import type {
  ProjectData,
  DiagramContent,
  PflichtenheftOutput,
  PflichtenheftSection,
} from "@/types";
import { generatePflichtenheft } from "@/ai/flows/pflichtenheft-flow";

export default function HomePage() {
  const { t, language } = useLanguage();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramContent | null>(null);
  const [pflichtenheftContent, setPflichtenheftContent] =
    useState<PflichtenheftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ProjectData) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);
    setError(null);
    setProjectData(data);
    setDiagrams(null);
    setPflichtenheftContent(null);

    try {
      console.log("Generating diagrams (client-side)...");
      let mindmapMd = `# ${data.projectName || "My Project"}\n`;
      if (data.projectGoal) mindmapMd += `## Goal: ${data.projectGoal}\n`;

      if (data.mainComponents && data.mainComponents.length > 0) {
        mindmapMd += `### Core Components\n`;
        data.mainComponents.forEach(
          (comp) => (mindmapMd += `  - ${comp.trim()}\n`)
        );
      }
      if (data.stakeholders && data.stakeholders.length > 0) {
        mindmapMd += `### Stakeholders\n`;
        data.stakeholders.forEach((sh) => (mindmapMd += `  - ${sh.trim()}\n`));
      }

      if (data.phases && data.phases.length > 0) {
        mindmapMd += `### Project Phases\n`;
        data.phases.forEach((phase) => {
          mindmapMd += `  - ${phase.name} (${phase.startDate} to ${phase.endDate})\n`;
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
            const taskName =
              phase.name.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() ||
              `Phase ${index + 1}`;
            const taskId =
              taskName.replace(/\s+/g, "_").slice(0, 50) || `task_${index}`;
            roadmapMm += `  section ${taskName}\n`;
            roadmapMm += `    ${taskName} :${taskId}_${index}, ${phase.startDate}, ${phase.endDate}\n`;
          }
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000)
          .toISOString()
          .split("T")[0];
        roadmapMm = `
gantt
  title No Phases Defined
  dateFormat YYYY-MM-DD
  section Empty
    Placeholder Task :ph_task, ${today}, ${tomorrow}
        `;
      }

      const diagramResults = {
        mindmapMarkdown: mindmapMd,
        roadmapMermaid: roadmapMm,
      };
      console.log("Diagrams generated:", diagramResults);
      setDiagrams(diagramResults);

      console.log("Calling generatePflichtenheft AI flow...");
      const pflichtenheftResult = await generatePflichtenheft(data);
      console.log("Pflichtenheft generated:", pflichtenheftResult);

      if (!pflichtenheftResult) {
        throw new Error(
          language === "de"
            ? "Die KI hat keine Ausgabe für das Pflichtenheft zurückgegeben."
            : "The AI did not return an output for the requirements specification."
        );
      }
      setPflichtenheftContent(pflichtenheftResult);
    } catch (e: any) {
      console.error("Error during content generation:", e);
      setError(
        `${t("content.error")}: ${e.message}${
          e.stack ? `\nStack: ${e.stack}` : ""
        }`
      );
    } finally {
      console.log("Finished content generation process.");
      setIsLoading(false);
    }
  };

  const safeFilenamePrefix =
    projectData?.projectName.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 50) ||
    "diagram";

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          {t("app.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("app.description")}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2">
          <Card className="shadow-xl h-full">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-accent" />
                {t("form.projectInfo")}
              </CardTitle>
              <CardDescription>
                {t("form.projectInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{t("content.error")}</p>
                <pre className="text-sm whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="p-4 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-900/20 rounded-md flex items-center justify-center min-h-[200px] shadow-xl">
              <PageLoaderIcon className="h-8 w-8 animate-spin mr-3" />
              <p className="text-lg font-medium">{t("content.loading")}</p>
            </div>
          )}

          {!isLoading && !diagrams && !pflichtenheftContent && !error && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-accent" />
                  {t("content.title")}
                </CardTitle>
                <CardDescription>{t("content.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center min-h-[200px] flex flex-col items-center justify-center">
                  <Info className="h-10 w-10 text-muted-foreground/70 mb-3" />
                  <p className="text-muted-foreground text-lg">
                    {t("content.placeholder")}
                  </p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    {t("content.instructions")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {diagrams && (
            <div className="space-y-8">
              <EnhancedMindmap
                title={t("viz.mindmap")}
                markdownContent={diagrams.mindmapMarkdown}
              />

              <Separator className="my-6" />

              <EnhancedGanttChart
                title={t("viz.gantt")}
                content={diagrams.roadmapMermaid}
              />
            </div>
          )}

          {pflichtenheftContent && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <BookText className="h-6 w-6 mr-2 text-accent" />
                  {t("pf.title")}
                </CardTitle>
                <CardDescription>{t("pf.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(pflichtenheftContent).map(([key, section]) => {
                  const currentSection = section as PflichtenheftSection;
                  if (
                    currentSection &&
                    typeof currentSection === "object" &&
                    "title" in currentSection &&
                    "content" in currentSection
                  ) {
                    return (
                      <div
                        key={key}
                        className="p-4 border rounded-lg shadow-sm bg-card"
                      >
                        <h3 className="text-xl font-semibold mb-3 text-primary">
                          {currentSection.title}
                        </h3>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: currentSection.content
                              .replace(
                                /```(\w+)?\n([\s\S]*?)\n```/g,
                                '<pre class="bg-muted/50 p-3 rounded-md overflow-x-auto"><code>$2</code></pre>'
                              )
                              .replace(
                                /`([^`]+)`/g,
                                '<code class="bg-muted/50 px-1 rounded text-sm">$1</code>'
                              )
                              .replace(/\n/g, "<br />"),
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      <footer className="mt-16 py-8 border-t text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Roadmap Weaver.{" "}
          {t("footer.powered")}
        </p>
      </footer>
    </div>
  );
}
