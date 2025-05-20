"use client";

import { useEffect, useRef, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import mermaid from "mermaid";
// Removed: import { optimize } from 'svgo';
import { ClientOnly } from "./ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Image as ImageIcon,
  FileText,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagramDisplayProps {
  title: string;
  type: "mindmap" | "mermaid";
  content: string;
  filenamePrefix?: string;
}

// Initialize Mermaid client-side
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral", // or 'default', 'forest', 'dark', 'neutral'
    gantt: {
      axisFormatter: [
        ["%Y-%m-%d", (d) => d.getDay() === 1], // Example: format for Mondays
      ],
      leftPadding: 75,
      rightPadding: 20,
      barHeight: 20,
      barGap: 4,
      topPadding: 50,
      fontSize: 12,
      sectionFontSize: 14,
    },
  });
}

export function DiagramDisplay({
  title,
  type,
  content,
  filenamePrefix = "diagram",
}: DiagramDisplayProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setError(null);
    const renderDiagram = async () => {
      console.log(
        `Attempting to render ${type} diagram with content:`,
        content
      );
      console.log("Refs available:", {
        svgRef: !!svgRef.current,
        mermaidContainerRef: !!mermaidContainerRef.current,
      });

      if (type === "mindmap" && svgRef.current && content) {
        try {
          console.log("Rendering mindmap...");
          const transformer = new Transformer();
          const { root } = transformer.transform(content);

          // Clear previous map
          while (svgRef.current.firstChild) {
            svgRef.current.removeChild(svgRef.current.firstChild);
          }
          const markmapInstance = Markmap.create(
            svgRef.current,
            undefined,
            root
          );
          console.log("Mindmap rendered successfully:", markmapInstance);
        } catch (e: any) {
          console.error("Mindmap Error:", e);
          setError("Failed to render Mindmap: " + e.message);
        }
      } else if (type === "mermaid" && mermaidContainerRef.current && content) {
        try {
          console.log("Rendering mermaid diagram...");
          // Clear previous diagram
          mermaidContainerRef.current.innerHTML = "";
          // Insert the Mermaid code into the div directly, Mermaid will find it.
          const graphId = `mermaid-graph-${Math.random()
            .toString(36)
            .substring(7)}`;
          console.log("Using graph ID:", graphId);
          const { svg } = await mermaid.render(graphId, content);
          console.log("Mermaid render result:", {
            svgLength: svg?.length || 0,
          });
          if (mermaidContainerRef.current) {
            mermaidContainerRef.current.innerHTML = svg;
            console.log("Mermaid diagram inserted into DOM");
          }
        } catch (e: any) {
          console.error("Mermaid Error:", e);
          setError("Failed to render Mermaid diagram: " + e.message);
          if (mermaidContainerRef.current) {
            mermaidContainerRef.current.innerHTML = `<p class="text-destructive">Error rendering: ${e.message}</p>`;
          }
        }
      }
    };

    renderDiagram();
  }, [type, content]);

  const getSvgString = (): string | null => {
    let svgElement: SVGSVGElement | null = null;
    if (type === "mindmap" && svgRef.current) {
      svgElement = svgRef.current.querySelector("svg") || svgRef.current; // Markmap.create wraps it in a SVG
    } else if (type === "mermaid" && mermaidContainerRef.current) {
      svgElement = mermaidContainerRef.current.querySelector("svg");
    }

    if (svgElement) {
      const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;

      // Ensure width and height are set for proper export
      if (
        !clonedSvgElement.getAttribute("width") ||
        !clonedSvgElement.getAttribute("height")
      ) {
        const bbox = svgElement.getBBox();
        let width = bbox.width + (bbox.x < 0 ? Math.abs(bbox.x) * 2 : 0) + 40; // Add padding
        let height = bbox.height + (bbox.y < 0 ? Math.abs(bbox.y) * 2 : 0) + 40; // Add padding

        // Ensure minimum dimensions
        width = Math.max(width, 300);
        height = Math.max(height, 200);

        clonedSvgElement.setAttribute("width", `${width}`);
        clonedSvgElement.setAttribute("height", `${height}`);
      }

      // Add a white background for PNG/PDF exports if not present
      const firstChild = clonedSvgElement.firstChild;
      let hasWhiteBg = false;
      if (
        firstChild instanceof SVGRectElement &&
        firstChild.getAttribute("fill") &&
        (firstChild.getAttribute("fill")?.toLowerCase() === "white" ||
          firstChild.getAttribute("fill") === "#FFFFFF")
      ) {
        hasWhiteBg = true;
      }

      if (!hasWhiteBg) {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "hsl(var(--card))"); // Use card background color
        clonedSvgElement.insertBefore(rect, firstChild);
      }
      return new XMLSerializer().serializeToString(clonedSvgElement);
    }
    return null;
  };

  const handleExport = async (format: "png" | "pdf") => {
    const svgString = getSvgString();
    if (!svgString) {
      toast({
        title: "Error",
        description: "No diagram content to export.",
        variant: "destructive",
      });
      return;
    }

    // SVGO optimization moved to server-side API route
    // const optimizedSvgResult = optimize(svgString, { /* ... */ });
    // const optimizedSvg = optimizedSvgResult.data;

    if (format === "png") setIsExportingPng(true);
    if (format === "pdf") setIsExportingPdf(true);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svg_content: svgString, // Send the raw SVG string
          format: format,
          filename: filenamePrefix,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filenamePrefix}_${type}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Export Successful",
          description: `Diagram exported as ${format.toUpperCase()}.`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Export Failed",
          description: errorData.error || response.statusText,
          variant: "destructive",
        });
        console.error("Export error:", errorData);
      }
    } catch (err: any) {
      toast({
        title: "Export Error",
        description: err.message,
        variant: "destructive",
      });
      console.error("Fetch export error:", err);
    } finally {
      if (format === "png") setIsExportingPng(false);
      if (format === "pdf") setIsExportingPdf(false);
    }
  };

  const FallbackDisplay = (
    <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin mr-2" />
      Loading diagram...
    </div>
  );

  return (
    <Card className="overflow-hidden shadow-lg border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {error && (
          <CardDescription className="text-destructive pt-1">
            {error}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ClientOnly fallback={FallbackDisplay}>
          {type === "mindmap" && (
            <svg
              ref={svgRef}
              className="w-full h-[500px] bg-card rounded-md shadow-inner border border-muted"
              data-testid="mindmap-svg"
            ></svg>
          )}
          {type === "mermaid" && (
            <div
              ref={mermaidContainerRef}
              className="w-full min-h-[500px] p-2 bg-card rounded-md shadow-inner border border-muted flex items-center justify-center overflow-auto"
              data-testid="mermaid-container"
            >
              {/* Mermaid will render here. Fallback text if content is empty or invalid. */}
              {!content.includes("gantt") &&
                !content.includes("graph") &&
                !error && (
                  <p className="text-muted-foreground text-center">
                    <Info className="inline h-5 w-5 mr-1" />
                    No valid diagram data provided. Please check your input.
                  </p>
                )}
            </div>
          )}
        </ClientOnly>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("png")}
          disabled={isExportingPng || !content || !!error}
          className="shadow-sm"
        >
          {isExportingPng ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="mr-2 h-4 w-4" />
          )}
          Export PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast({
              title: "PDF Export Information",
              description:
                "Server-side PDF export is complex. For now, try printing to PDF from your browser (Ctrl/Cmd + P), or implement a client-side PDF solution like jsPDF for basic SVGs.",
              duration: 8000,
            });
          }}
          disabled={isExportingPdf || !content || !!error}
          title="PDF export from server is advanced. Consider browser print-to-PDF."
          className="shadow-sm"
        >
          {isExportingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Export PDF (Info)
        </Button>
      </CardFooter>
    </Card>
  );
}
