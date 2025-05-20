"use client";

import { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import mermaid from "mermaid";

export function SimpleDiagramTest() {
  const mindmapRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic tests to see if the libraries are working
    console.log("Running diagram tests");

    // Test Markmap
    if (mindmapRef.current) {
      try {
        console.log("Testing Markmap rendering...");
        const transformer = new Transformer();
        const { root } = transformer.transform("# Test Mindmap\n## Child Node");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "200px");
        mindmapRef.current.innerHTML = "";
        mindmapRef.current.appendChild(svg);
        Markmap.create(svg, undefined, root);
        console.log("Markmap test successful");
      } catch (error) {
        console.error("Markmap test failed:", error);
        mindmapRef.current.innerHTML = `<div style="color: red">Markmap Error: ${error instanceof Error ? error.message : String(error)}</div>`;
      }
    }

    // Test Mermaid
    if (mermaidRef.current) {
      try {
        console.log("Testing Mermaid rendering...");
        const mermaidCode = `
graph TD
  A[Start] --> B[End]
`;
        mermaidRef.current.innerHTML = "";
        mermaid.render("test-mermaid", mermaidCode).then(({ svg }) => {
          mermaidRef.current!.innerHTML = svg;
          console.log("Mermaid test successful");
        }).catch(error => {
          console.error("Mermaid test failed:", error);
          mermaidRef.current!.innerHTML = `<div style="color: red">Mermaid Error: ${error instanceof Error ? error.message : String(error)}</div>`;
        });
      } catch (error) {
        console.error("Mermaid overall test failed:", error);
        mermaidRef.current.innerHTML = `<div style="color: red">Mermaid Init Error: ${error instanceof Error ? error.message : String(error)}</div>`;
      }
    }
  }, []);

  return (
    <div className="space-y-6 border-2 border-dashed border-yellow-500 p-4 my-4 bg-yellow-50 dark:bg-yellow-950">
      <h2 className="text-lg font-bold">Diagram Library Test</h2>
      <div>
        <h3 className="text-md font-semibold mb-2">Markmap Test:</h3>
        <div 
          ref={mindmapRef}
          className="h-[200px] border border-gray-300 bg-white dark:bg-gray-800 rounded"
        ></div>
      </div>
      <div>
        <h3 className="text-md font-semibold mb-2">Mermaid Test:</h3>
        <div 
          ref={mermaidRef}
          className="h-[200px] border border-gray-300 bg-white dark:bg-gray-800 rounded"
        ></div>
      </div>
    </div>
  );
} 