"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Maximize2,
  PaintBucket,
  LayoutGrid,
  Sliders,
  CalendarClock,
} from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  section: string;
}

interface EnhancedGanttChartProps {
  content: string; // Mermaid gantt chart content
  title: string;
}

// Style presets for the Gantt chart
const stylePresets = {
  classic: {
    barColor: "#6366f1", // Indigo
    barTextColor: "white",
    sectionTitleColor: "#6366f1",
    sectionBgColor: "#f1f5f9",
    timelineColor: "#94a3b8",
    dateColor: "#64748b",
  },
  modern: {
    barColor: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    barTextColor: "white",
    sectionTitleColor: "#3b82f6",
    sectionBgColor: "#f8fafc",
    timelineColor: "#cbd5e1",
    dateColor: "#64748b",
  },
  dark: {
    barColor: "#1e1e2e",
    barTextColor: "#cdd6f4",
    sectionTitleColor: "#cdd6f4",
    sectionBgColor: "#313244",
    timelineColor: "#7f849c",
    dateColor: "#9399b2",
  },
  colorful: {
    barColor: (section: string) => {
      // Generate different colors for different sections
      const colors = ["#fb7185", "#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];
      // Simple hash function to pick a color based on section name
      const hash = section.split("").reduce((a, b) => {
        return a + b.charCodeAt(0);
      }, 0);
      return colors[hash % colors.length];
    },
    barTextColor: "white",
    sectionTitleColor: "#f43f5e",
    sectionBgColor: "#fdf2f8",
    timelineColor: "#e5e7eb",
    dateColor: "#64748b",
  },
  simple: {
    barColor: "#4b5563",
    barTextColor: "white",
    sectionTitleColor: "#111827",
    sectionBgColor: "#f3f4f6",
    timelineColor: "#9ca3af",
    dateColor: "#6b7280",
  },
};

// Display options for the Gantt chart
const displayOptions = {
  rowHeight: 40,
  showDateMarkers: true,
  compactView: false,
  showWeekends: true,
};

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

// Check if a date is a weekend
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

export function EnhancedGanttChart({
  content,
  title,
}: EnhancedGanttChartProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedStyle, setSelectedStyle] =
    useState<keyof typeof stylePresets>("classic");
  const [rowHeight, setRowHeight] = useState(displayOptions.rowHeight);
  const [showDateMarkers, setShowDateMarkers] = useState(
    displayOptions.showDateMarkers
  );
  const [compactView, setCompactView] = useState(displayOptions.compactView);
  const [showWeekends, setShowWeekends] = useState(displayOptions.showWeekends);

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

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Generate date markers for the timeline
  const getDateMarkers = () => {
    if (!startDate || !endDate || !showDateMarkers) return null;

    const markers = [];
    const currentDate = new Date(startDate);
    const stylePreset = stylePresets[selectedStyle];

    while (currentDate <= endDate) {
      const dayOffset = daysBetween(startDate, currentDate);
      const offsetPercent = (dayOffset / totalDays) * 100;
      
      // Skip weekends if not showing them
      if (!showWeekends && isWeekend(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      markers.push(
        <div
          key={currentDate.toISOString()}
          className="absolute top-0 h-full border-l"
          style={{
            left: `${offsetPercent}%`,
            borderColor: 
              isWeekend(currentDate) && showWeekends
                ? "rgba(239, 68, 68, 0.2)" // Light red for weekends
                : "rgba(203, 213, 225, 0.5)", // Light gray for weekdays
          }}
        >
          <div
            className="absolute -top-6 -translate-x-1/2 text-xs px-1"
            style={{ color: stylePreset.dateColor }}
          >
            {formatDate(new Date(currentDate))}
          </div>
        </div>
      );
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return <div className="absolute inset-0">{markers}</div>;
  };

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

  const stylePreset = stylePresets[selectedStyle];

  return (
    <Card
      className={`shadow-lg border border-primary mb-6 ${
        fullscreen ? "fixed inset-4 z-50 m-0 overflow-auto" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title={fullscreen ? t("viz.mindmap.exitFullscreen") : t("viz.mindmap.fullscreen")}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={`${fullscreen ? "h-[calc(100vh-12rem)]" : "h-[500px]"} overflow-auto`}
      >
        {error ? (
          <div className="h-[400px] flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {startDate && endDate && (
              <div className="min-w-[800px]">
                {/* Date range display */}
                <div 
                  className="mb-4 text-sm font-medium" 
                  style={{ color: stylePreset.sectionTitleColor }}
                >
                  {t("viz.timespan")}: {formatDate(startDate)} bis{" "}
                  {formatDate(endDate)} ({totalDays} {t("viz.days")})
                </div>

                {/* Gantt chart */}
                <div 
                  className="space-y-6 relative"
                  style={{ 
                    marginTop: showDateMarkers ? "2rem" : "0" 
                  }}
                >
                  {showDateMarkers && getDateMarkers()}
                  
                  {Object.entries(sections).map(
                    ([sectionName, sectionTasks]) => (
                      <div 
                        key={sectionName} 
                        className="mb-6"
                        style={{ 
                          backgroundColor: compactView ? "transparent" : stylePreset.sectionBgColor,
                          padding: compactView ? "0" : "1rem",
                          borderRadius: "0.5rem"
                        }}
                      >
                        <h3 
                          className="font-bold mb-2"
                          style={{ color: stylePreset.sectionTitleColor }}
                        >
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

                            // Determine bar color (for colorful style, it depends on section)
                            const barColor = 
                              typeof stylePreset.barColor === 'function' 
                                ? stylePreset.barColor(task.section)
                                : stylePreset.barColor;

                            return (
                              <div
                                key={task.id}
                                className="relative rounded"
                                style={{ 
                                  height: `${rowHeight}px`,
                                  backgroundColor: "rgba(241, 245, 249, 0.5)"
                                }}
                              >
                                {/* Task timeline bar */}
                                <div
                                  className="absolute top-0 h-full rounded flex items-center px-2 text-sm overflow-hidden"
                                  style={{
                                    left: `${offsetPercent}%`,
                                    width: `${widthPercent}%`,
                                    minWidth: "50px",
                                    background: barColor,
                                    color: stylePreset.barTextColor
                                  }}
                                >
                                  {task.name}
                                </div>

                                {/* Task dates */}
                                <div 
                                  className="absolute -bottom-5 left-0 text-xs"
                                  style={{ color: stylePreset.dateColor }}
                                >
                                  {formatDate(task.startDate)}
                                </div>
                                <div 
                                  className="absolute -bottom-5 right-0 text-xs"
                                  style={{ color: stylePreset.dateColor }}
                                >
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

      <CardFooter className="flex flex-col space-y-4">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="style">
              <PaintBucket className="h-4 w-4 mr-2" />
              {t("viz.mindmap.style")}
            </TabsTrigger>
            <TabsTrigger value="layout">
              <LayoutGrid className="h-4 w-4 mr-2" />
              {t("viz.gantt.layout")}
            </TabsTrigger>
            <TabsTrigger value="options">
              <Sliders className="h-4 w-4 mr-2" />
              {t("viz.gantt.options")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-2">
            <div className="grid grid-cols-5 gap-2">
              {(
                Object.keys(stylePresets) as Array<keyof typeof stylePresets>
              ).map((style) => (
                <Button
                  key={style}
                  variant={selectedStyle === style ? "default" : "outline"}
                  onClick={() => setSelectedStyle(style)}
                  className="h-12 capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="mt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t("viz.gantt.rowHeight")}: {rowHeight}px
                </Label>
                <Slider
                  min={20}
                  max={80}
                  step={5}
                  value={[rowHeight]}
                  onValueChange={(value) => setRowHeight(value[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="compact-view"
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
                <Label htmlFor="compact-view">{t("viz.gantt.compactView")}</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="mt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="date-markers"
                  checked={showDateMarkers}
                  onCheckedChange={setShowDateMarkers}
                />
                <Label htmlFor="date-markers">{t("viz.gantt.showDateMarkers")}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-weekends"
                  checked={showWeekends}
                  onCheckedChange={setShowWeekends}
                />
                <Label htmlFor="show-weekends">{t("viz.gantt.showWeekends")}</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
} 