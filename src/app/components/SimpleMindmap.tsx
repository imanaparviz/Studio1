"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "react-flow-renderer";
import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

interface SimpleMindmapProps {
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
    // Skip empty lines
    if (!trimmedLine) return;

    // Calculate the level based on # or - prefixes
    let level = 0;
    let name = trimmedLine;

    if (trimmedLine.startsWith("#")) {
      // For # headers
      level = trimmedLine.indexOf(" ");
      name = trimmedLine.substring(level + 1).trim();
    } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
      // For list items
      level = trimmedLine.indexOf("-") + 1;
      name = trimmedLine.substring(trimmedLine.indexOf("-") + 1).trim();
    }

    // Ensure level is at least 1
    level = Math.max(1, level);

    // Pop stack until we find a parent of a lower level
    while (stack.length > 1 && stack[stack.length - 1][1] >= level) {
      stack.pop();
    }

    // Create new node
    const newNode: MindmapNode = { name, children: [] };
    const parent = stack[stack.length - 1][0];
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);

    // Push this node onto the stack
    stack.push([newNode, level]);
  });

  // If the root has only one child, return that child as the root
  return root.children && root.children.length === 1 ? root.children[0] : root;
}

// Convert hierarchy to ReactFlow nodes and edges
function convertHierarchyToFlow(hierarchyData: MindmapNode): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let id = 0;

  const h = hierarchy(hierarchyData);

  // Create a layout
  h.each((node) => {
    const currentId = `${id++}`;
    const depth = node.depth;

    nodes.push({
      id: currentId,
      data: { label: (node.data as MindmapNode).name },
      position: { x: depth * 250, y: nodes.length * 80 },
      style: {
        background: depth === 0 ? "#6366f1" : "#f1f5f9",
        color: depth === 0 ? "white" : "black",
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        padding: "10px",
        minWidth: "150px",
        textAlign: "center" as const,
      },
    });

    if (node.parent) {
      edges.push({
        id: `e${node.parent.data.name}-${currentId}`,
        source: `${nodes.findIndex(
          (n) => n.data.label === (node.parent?.data as MindmapNode).name
        )}`,
        target: currentId,
        style: { stroke: "#94a3b8" },
        animated: true,
      });
    }
  });

  return { nodes, edges };
}

export function SimpleMindmap({ markdownContent, title }: SimpleMindmapProps) {
  const { t } = useLanguage();
  const [elements, setElements] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!markdownContent) {
      setLoading(false);
      return;
    }

    try {
      // Parse the markdown to a hierarchical structure
      const hierarchyData = parseMarkdownToHierarchy(markdownContent);
      console.log("Parsed hierarchy:", hierarchyData);

      // Convert to ReactFlow nodes and edges
      const { nodes, edges } = convertHierarchyToFlow(hierarchyData);
      console.log("Generated nodes:", nodes);
      console.log("Generated edges:", edges);

      setElements({ nodes, edges });
    } catch (error) {
      console.error("Error creating mindmap:", error);
    } finally {
      setLoading(false);
    }
  }, [markdownContent]);

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
    <Card className="shadow-lg border border-primary mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {elements.nodes.length > 0 ? (
          <ReactFlow
            nodes={elements.nodes}
            edges={elements.edges}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background color="#f8fafc" gap={16} />
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {t("content.placeholder")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
