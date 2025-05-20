"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  section: string;
}

interface SimpleGanttChartProps {
  content: string; // Mermaid gantt chart content
  title: string;
}

// Parse mermaid gantt chart content
function parseMermaidGantt(content: string): GanttTask[] {
  const tasks: GanttTask[] = [];
  let currentSection = "Default";

  // Parse each line
  const lines = content.split("\n");
  let taskId = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and directives
    if (
      !trimmedLine ||
      trimmedLine.startsWith("gantt") ||
      trimmedLine.startsWith("title") ||
      trimmedLine.startsWith("dateFormat") ||
      trimmedLine.startsWith("axisFormat")
    ) {
      continue;
    }

    // Section definition
    if (trimmedLine.startsWith("section")) {
      currentSection = trimmedLine.substring(7).trim();
      continue;
    }

    // Task definition
    const taskMatch = trimmedLine.match(
      /([^:]+)\s*:\s*([^,]+)?\s*,\s*([^,]+)\s*,\s*([^,]+)/
    );
    if (taskMatch) {
      const taskName = taskMatch[1].trim();
      const taskIdStr = taskMatch[2] ? taskMatch[2].trim() : `task_${taskId++}`;
      const startDateStr = taskMatch[3].trim();
      const endDateStr = taskMatch[4].trim();

      // Parse dates based on the specified format
      let startDate: Date, endDate: Date;

      // For simplicity, we're assuming YYYY-MM-DD format
      try {
        startDate = new Date(startDateStr);
        endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date format:", startDateStr, endDateStr);
          continue;
        }

        tasks.push({
          id: taskIdStr,
          name: taskName,
          startDate,
          endDate,
          section: currentSection,
        });
      } catch (e) {
        console.error("Error parsing dates:", e);
      }
    }
  }

  return tasks;
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

// Format date as DD.MM.YYYY
function formatDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getFullYear()}`;
}

export function SimpleGanttChart({ content, title }: SimpleGanttChartProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (!content) {
      setLoading(false);
      return;
    }

    try {
      // Parse gantt chart data
      const parsedTasks = parseMermaidGantt(content);
      console.log("Parsed gantt tasks:", parsedTasks);

      if (parsedTasks.length === 0) {
        setError(t("viz.noTasks"));
        setLoading(false);
        return;
      }

      setTasks(parsedTasks);

      // Find date ranges
      const minDate = new Date(
        Math.min(...parsedTasks.map((t) => t.startDate.getTime()))
      );
      const maxDate = new Date(
        Math.max(...parsedTasks.map((t) => t.endDate.getTime()))
      );

      // Add 1 day padding on both sides
      const startWithPadding = new Date(minDate);
      startWithPadding.setDate(startWithPadding.getDate() - 1);

      const endWithPadding = new Date(maxDate);
      endWithPadding.setDate(endWithPadding.getDate() + 1);

      setStartDate(startWithPadding);
      setEndDate(endWithPadding);
      setTotalDays(daysBetween(startWithPadding, endWithPadding));
    } catch (error) {
      console.error("Error creating gantt chart:", error);
      setError(`${t("content.error")}: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [content, t]);

  if (loading) {
    return (
      <Card className="shadow-lg border border-primary mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Group tasks by section
  const sections = tasks.reduce((sections, task) => {
    if (!sections[task.section]) {
      sections[task.section] = [];
    }
    sections[task.section].push(task);
    return sections;
  }, {} as Record<string, GanttTask[]>);

  return (
    <Card className="shadow-lg border border-primary mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="h-[400px] flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {startDate && endDate && (
              <div className="min-w-[800px]">
                {/* Date range display */}
                <div className="mb-4 text-sm font-medium">
                  {t("viz.timespan")}: {formatDate(startDate)} bis{" "}
                  {formatDate(endDate)} ({totalDays} {t("viz.days")})
                </div>

                {/* Gantt chart */}
                <div className="space-y-6">
                  {Object.entries(sections).map(
                    ([sectionName, sectionTasks]) => (
                      <div key={sectionName} className="mb-6">
                        <h3 className="font-bold mb-2 text-primary">
                          {sectionName}
                        </h3>
                        <div className="space-y-2">
                          {sectionTasks.map((task) => {
                            // Calculate position and width
                            const offsetDays = daysBetween(
                              startDate,
                              task.startDate
                            );
                            const taskDuration = daysBetween(
                              task.startDate,
                              task.endDate
                            );
                            const offsetPercent =
                              (offsetDays / totalDays) * 100;
                            const widthPercent =
                              (taskDuration / totalDays) * 100;

                            return (
                              <div
                                key={task.id}
                                className="relative h-10 bg-slate-100 dark:bg-slate-800 rounded"
                              >
                                {/* Task timeline bar */}
                                <div
                                  className="absolute top-0 h-full bg-indigo-500 rounded flex items-center px-2 text-white text-sm overflow-hidden"
                                  style={{
                                    left: `${offsetPercent}%`,
                                    width: `${widthPercent}%`,
                                    minWidth: "50px",
                                  }}
                                >
                                  {task.name}
                                </div>

                                {/* Task dates */}
                                <div className="absolute -bottom-5 left-0 text-xs text-slate-500">
                                  {formatDate(task.startDate)}
                                </div>
                                <div className="absolute -bottom-5 right-0 text-xs text-slate-500">
                                  {formatDate(task.endDate)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
