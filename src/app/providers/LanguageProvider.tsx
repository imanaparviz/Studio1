"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  de: {
    // Header    "app.title": "Roadmap Weaver",    "app.description":      "Erstellen Sie mühelos Projekt-Mindmaps, Roadmaps und Pflichtenheft-Entwürfe. Geben Sie Ihre Daten ein und lassen Sie uns Ihren Weg zum Erfolg visualisieren und dokumentieren.",    // Form    "form.projectInfo": "Projektinformationen",    "form.projectInfo.description":      "Füllen Sie die Details unten aus, um Ihre Diagramme und das Pflichtenheft zu generieren.",    "form.projectName": "Projektname",    "form.projectGoal": "Projektziel",    "form.mainComponents": "Hauptkomponenten (kommagetrennt)",    "form.stakeholders": "Stakeholder (kommagetrennt)",    "form.phases": "Projektphasen",    "form.phase": "Phase",    "form.phaseName": "Name",    "form.startDate": "Startdatum",    "form.endDate": "Enddatum",    "form.addPhase": "Phase hinzufügen",    "form.generate": "Inhalte generieren",    // Content sections    "content.title": "Generierte Inhalte",    "content.description":      "Ihre Projektdiagramme und der Pflichtenheft-Entwurf erscheinen hier.",    "content.placeholder": "Inhalte erscheinen hier nach der Generierung.",    "content.instructions":      'Füllen Sie das Formular aus und klicken Sie auf "Inhalte generieren".',    "content.loading": "Generiere Inhalte, bitte warten...",    "content.error": "Fehler beim Generieren",    // Visualizations    "viz.mindmap": "Projekt Mind Map",    "viz.gantt": "Projekt Roadmap (Gantt Chart)",    "viz.timespan": "Zeitraum",    "viz.days": "Tage",    "viz.noTasks": "Keine gültigen Aufgaben im Gantt-Chart gefunden",    // Enhanced Mindmap options    "viz.mindmap.style": "Stil",    "viz.mindmap.layout": "Layout",    "viz.mindmap.spacing": "Abstand",    "viz.mindmap.horizontal": "Horizontal",    "viz.mindmap.vertical": "Vertikal",    "viz.mindmap.radial": "Radiär",    "viz.mindmap.nodeSpacing": "Knotenabstand",    "viz.mindmap.fullscreen": "Vollbild",    "viz.mindmap.exitFullscreen": "Vollbild beenden",        // Enhanced Gantt chart options    "viz.gantt.layout": "Layout",    "viz.gantt.options": "Optionen",    "viz.gantt.rowHeight": "Zeilenhöhe",    "viz.gantt.compactView": "Kompakte Ansicht",    "viz.gantt.showDateMarkers": "Datumsmarkierungen anzeigen",    "viz.gantt.showWeekends": "Wochenenden anzeigen",

    // Pflichtenheft
    "pf.title": "Pflichtenheft Entwurf (KI-generiert)",
    "pf.description":
      "Ein KI-generierter Entwurf basierend auf Ihren Projektdaten. Überprüfen und verfeinern Sie diesen Entwurf.",

    // Footer
    "footer.powered":
      "Powered by Next.js, Tailwind CSS, Genkit, React Flow, and D3.",

    // Language selector
    "lang.switch": "Sprache ändern",
    "lang.en": "Englisch",
    "lang.de": "Deutsch",
  },
  en: {
    // Header    "app.title": "Roadmap Weaver",    "app.description":      "Effortlessly create project mindmaps, roadmaps, and requirements specifications. Enter your data and let us visualize and document your path to success.",    // Form    "form.projectInfo": "Project Information",    "form.projectInfo.description":      "Fill in the details below to generate your diagrams and requirements specification.",    "form.projectName": "Project Name",    "form.projectGoal": "Project Goal",    "form.mainComponents": "Main Components (comma separated)",    "form.stakeholders": "Stakeholders (comma separated)",    "form.phases": "Project Phases",    "form.phase": "Phase",    "form.phaseName": "Name",    "form.startDate": "Start Date",    "form.endDate": "End Date",    "form.addPhase": "Add Phase",    "form.generate": "Generate Content",    // Content sections    "content.title": "Generated Content",    "content.description":      "Your project diagrams and requirements specification draft will appear here.",    "content.placeholder": "Content will appear here after generation.",    "content.instructions": 'Fill out the form and click "Generate Content".',    "content.loading": "Generating content, please wait...",    "content.error": "Error generating content",    // Visualizations    "viz.mindmap": "Project Mind Map",    "viz.gantt": "Project Roadmap (Gantt Chart)",    "viz.timespan": "Timespan",    "viz.days": "days",    "viz.noTasks": "No valid tasks found in the Gantt chart",    // Enhanced Mindmap options    "viz.mindmap.style": "Style",    "viz.mindmap.layout": "Layout",    "viz.mindmap.spacing": "Spacing",    "viz.mindmap.horizontal": "Horizontal",    "viz.mindmap.vertical": "Vertical",    "viz.mindmap.radial": "Radial",    "viz.mindmap.nodeSpacing": "Node Spacing",    "viz.mindmap.fullscreen": "Fullscreen",    "viz.mindmap.exitFullscreen": "Exit Fullscreen",        // Enhanced Gantt chart options    "viz.gantt.layout": "Layout",    "viz.gantt.options": "Options",    "viz.gantt.rowHeight": "Row Height",    "viz.gantt.compactView": "Compact View",    "viz.gantt.showDateMarkers": "Show Date Markers",    "viz.gantt.showWeekends": "Show Weekends",

    // Pflichtenheft
    "pf.title": "Requirements Specification Draft (AI-generated)",
    "pf.description":
      "An AI-generated draft based on your project data. Review and refine this draft.",

    // Footer
    "footer.powered":
      "Powered by Next.js, Tailwind CSS, Genkit, React Flow, and D3.",

    // Language selector
    "lang.switch": "Change Language",
    "lang.en": "English",
    "lang.de": "German",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with German or get from localStorage if available
  const [language, setLanguageState] = useState<Language>("de");

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "de" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
