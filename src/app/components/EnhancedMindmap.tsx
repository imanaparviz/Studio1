"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  BackgroundVariant,
} from "react-flow-renderer";
import { hierarchy } from "d3-hierarchy";
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
  Grid,
  Circle,
  Square,
  Box,
  PaintBucket,
} from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

interface EnhancedMindmapProps {
  markdownContent: string;
  title: string;
}

// Parse markdown into a hierarchy structure
function parseMarkdownToHierarchy(markdownContent: string): MindmapNode {
  const lines = markdownContent
    .split("\n")
    .filter((line) => line.trim() !== "");
  const root: MindmapNode = { name: "Root", children: [] };
  const stack: [MindmapNode, number][] = [[root, 0]];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let level = 0;
    let name = trimmedLine;

    if (trimmedLine.startsWith("#")) {
      level = trimmedLine.indexOf(" ");
      name = trimmedLine.substring(level + 1).trim();
    } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
      level = trimmedLine.indexOf("-") + 1;
      name = trimmedLine.substring(trimmedLine.indexOf("-") + 1).trim();
    }

    level = Math.max(1, level);

    while (stack.length > 1 && stack[stack.length - 1][1] >= level) {
      stack.pop();
    }

    const newNode: MindmapNode = { name, children: [] };
    const parent = stack[stack.length - 1][0];
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);

    stack.push([newNode, level]);
  });

  return root.children && root.children.length === 1 ? root.children[0] : root;
}

// Map of visual style presets
const stylePresets = {
  classic: {
    nodeStyles: {
      root: {
        background: "#6366f1",
        color: "white",
        border: "1px solid #4f46e5",
        borderRadius: "4px",
        padding: "10px",
        minWidth: "150px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      child: {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        padding: "10px",
        minWidth: "150px",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
    edgeStyles: {
      stroke: "#94a3b8",
      strokeWidth: 2,
      animated: true,
    },
    bgColor: "#f8fafc",
    bgPattern: BackgroundVariant.Dots,
    layout: "horizontal",
  },
  modern: {
    nodeStyles: {
      root: {
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "12px",
        minWidth: "160px",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      child: {
        background: "white",
        color: "#1e293b",
        border: "none",
        borderRadius: "12px",
        padding: "12px",
        minWidth: "160px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
    edgeStyles: {
      stroke: "#c7d2fe",
      strokeWidth: 3,
      animated: true,
    },
    bgColor: "#f1f5f9",
    bgPattern: BackgroundVariant.Dots,
    layout: "horizontal",
  },
  dark: {
    nodeStyles: {
      root: {
        background: "#1e1e2e",
        color: "#cdd6f4",
        border: "1px solid #313244",
        borderRadius: "8px",
        padding: "12px",
        minWidth: "150px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      },
      child: {
        background: "#313244",
        color: "#cdd6f4",
        border: "1px solid #45475a",
        borderRadius: "8px",
        padding: "12px",
        minWidth: "150px",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)",
      },
    },
    edgeStyles: {
      stroke: "#6c7086",
      strokeWidth: 2,
      animated: true,
    },
    bgColor: "#181825",
    bgPattern: BackgroundVariant.Dots,
    layout: "horizontal",
  },
  colorful: {
    nodeStyles: {
      root: {
        background: "#fb7185",
        color: "white",
        border: "none",
        borderRadius: "15px",
        padding: "12px",
        minWidth: "150px",
        boxShadow:
          "0 10px 15px -3px rgba(251, 113, 133, 0.3), 0 4px 6px -2px rgba(251, 113, 133, 0.2)",
      },
      child: (depth: number) => {
        const colors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
        return {
          background: colors[(depth - 1) % colors.length],
          color: "white",
          border: "none",
          borderRadius: "15px",
          padding: "12px",
          minWidth: "150px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        };
      },
    },
    edgeStyles: {
      stroke: "#d1d5db",
      strokeWidth: 2,
      animated: true,
    },
    bgColor: "#fafafa",
    bgPattern: BackgroundVariant.Dots,
    layout: "horizontal",
  },
  simple: {
    nodeStyles: {
      root: {
        background: "#f3f4f6",
        color: "#111827",
        border: "2px solid #4b5563",
        borderRadius: "4px",
        padding: "10px",
        minWidth: "150px",
        boxShadow: "none",
      },
      child: {
        background: "#f3f4f6",
        color: "#111827",
        border: "1px solid #9ca3af",
        borderRadius: "4px",
        padding: "10px",
        minWidth: "150px",
        boxShadow: "none",
      },
    },
    edgeStyles: {
      stroke: "#9ca3af",
      strokeWidth: 1,
      animated: false,
    },
    bgColor: "#ffffff",
    bgPattern: BackgroundVariant.Dots,
    layout: "horizontal",
  },
};

export function EnhancedMindmap({
  markdownContent,
  title,
}: EnhancedMindmapProps) {
  const { t } = useLanguage();
  const [elements, setElements] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] =
    useState<keyof typeof stylePresets>("classic");
  const [layout, setLayout] = useState<"horizontal" | "vertical" | "radial">(
    "horizontal"
  );
  const [spacing, setSpacing] = useState<number>(80);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!markdownContent) {
      setLoading(false);
      return;
    }

    try {
      const hierarchyData = parseMarkdownToHierarchy(markdownContent);

      // Generate nodes and edges with the selected layout and style
      generateElements(hierarchyData, selectedStyle, layout, spacing);
    } catch (error) {
      console.error("Error creating mindmap:", error);
    } finally {
      setLoading(false);
    }
  }, [markdownContent, selectedStyle, layout, spacing]);

  // Function to create nodes and edges based on hierarchy data
  const generateElements = (
    hierarchyData: MindmapNode,
    style: keyof typeof stylePresets,
    layoutType: "horizontal" | "vertical" | "radial",
    nodeSpacing: number
  ) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let id = 0;

    const stylePreset = stylePresets[style];
    const h = hierarchy(hierarchyData);

    // Different layout algorithms
    if (layoutType === "horizontal") {
      // Horizontal layout
      h.each((node) => {
        const currentId = `${id++}`;
        const depth = node.depth;
        const verticalPos = nodes.length * nodeSpacing;

        nodes.push({
          id: currentId,
          data: { label: (node.data as MindmapNode).name },
          position: { x: depth * 250, y: verticalPos },
          style:
            depth === 0
              ? stylePreset.nodeStyles.root
              : typeof stylePreset.nodeStyles.child === "function"
              ? stylePreset.nodeStyles.child(depth)
              : stylePreset.nodeStyles.child,
        });

        if (node.parent) {
          edges.push({
            id: `e${currentId}`,
            source: `${nodes.findIndex(
              (n) => n.data.label === (node.parent?.data as MindmapNode).name
            )}`,
            target: currentId,
            style: stylePreset.edgeStyles,
            animated: stylePreset.edgeStyles.animated,
          });
        }
      });
    } else if (layoutType === "vertical") {
      // Vertical layout
      h.each((node) => {
        const currentId = `${id++}`;
        const depth = node.depth;
        const horizontalPos = nodes.length * nodeSpacing;

        nodes.push({
          id: currentId,
          data: { label: (node.data as MindmapNode).name },
          position: { x: horizontalPos, y: depth * 150 },
          style:
            depth === 0
              ? stylePreset.nodeStyles.root
              : typeof stylePreset.nodeStyles.child === "function"
              ? stylePreset.nodeStyles.child(depth)
              : stylePreset.nodeStyles.child,
        });

        if (node.parent) {
          edges.push({
            id: `e${currentId}`,
            source: `${nodes.findIndex(
              (n) => n.data.label === (node.parent?.data as MindmapNode).name
            )}`,
            target: currentId,
            style: stylePreset.edgeStyles,
            animated: stylePreset.edgeStyles.animated,
          });
        }
      });
    } else if (layoutType === "radial") {
      // Radial layout
      const centerX = 300;
      const centerY = 300;
      const radius = 200;

      h.each((node) => {
        const currentId = `${id++}`;
        const depth = node.depth;
        const siblings = node.parent ? node.parent.children?.length || 1 : 1;
        const index = node.parent
          ? node.parent.children?.indexOf(node) || 0
          : 0;

        // Calculate position based on depth and index
        const angle = (index / siblings) * 2 * Math.PI;
        const nodeRadius = depth * (radius / (h.height + 1));

        const x = centerX + nodeRadius * Math.cos(angle);
        const y = centerY + nodeRadius * Math.sin(angle);

        nodes.push({
          id: currentId,
          data: { label: (node.data as MindmapNode).name },
          position: { x, y },
          style:
            depth === 0
              ? stylePreset.nodeStyles.root
              : typeof stylePreset.nodeStyles.child === "function"
              ? stylePreset.nodeStyles.child(depth)
              : stylePreset.nodeStyles.child,
        });

        if (node.parent) {
          edges.push({
            id: `e${currentId}`,
            source: `${nodes.findIndex(
              (n) => n.data.label === (node.parent?.data as MindmapNode).name
            )}`,
            target: currentId,
            style: stylePreset.edgeStyles,
            animated: stylePreset.edgeStyles.animated,
          });
        }
      });
    }

    setElements({ nodes, edges });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
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
            title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={fullscreen ? "h-[calc(100vh-12rem)]" : "h-[500px]"}
      >
        {elements.nodes.length > 0 ? (
          <ReactFlow
            nodes={elements.nodes}
            edges={elements.edges}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap nodeStrokeWidth={3} />
            <Background
              color={stylePresets[selectedStyle].bgColor}
              gap={16}
              variant={stylePresets[selectedStyle].bgPattern}
            />
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {t("content.placeholder")}
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
              <Grid className="h-4 w-4 mr-2" />
              {t("viz.mindmap.layout")}
            </TabsTrigger>
            <TabsTrigger value="spacing">
              <Box className="h-4 w-4 mr-2" />
              {t("viz.mindmap.spacing")}
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
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={layout === "horizontal" ? "default" : "outline"}
                onClick={() => setLayout("horizontal")}
              >
                {t("viz.mindmap.horizontal")}
              </Button>
              <Button
                variant={layout === "vertical" ? "default" : "outline"}
                onClick={() => setLayout("vertical")}
              >
                {t("viz.mindmap.vertical")}
              </Button>
              <Button
                variant={layout === "radial" ? "default" : "outline"}
                onClick={() => setLayout("radial")}
              >
                {t("viz.mindmap.radial")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="mt-2">
            <div className="space-y-2">
              <Label>
                {t("viz.mindmap.nodeSpacing")}: {spacing}px
              </Label>
              <Slider
                min={30}
                max={150}
                step={5}
                value={[spacing]}
                onValueChange={(value) => setSpacing(value[0])}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
}
