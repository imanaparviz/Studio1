"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import type { ProjectData, ProjectPhase } from "@/types";

interface InputFormProps {
  onSubmit: (data: ProjectData) => void;
  isLoading: boolean;
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const { t, language } = useLanguage();
  const [projectName, setProjectName] = useState(
    language === "de" ? "Mein großartiges Projekt" : "My awesome project"
  );
  const [projectGoal, setProjectGoal] = useState(
    language === "de"
      ? "Etwas Erstaunliches erschaffen!"
      : "Create something amazing!"
  );
  const [mainComponentsStr, setMainComponentsStr] = useState(
    language === "de"
      ? "Backend, Frontend, Datenbank"
      : "Backend, Frontend, Database"
  );
  const [stakeholdersStr, setStakeholdersStr] = useState(
    language === "de"
      ? "Kunde, Entwicklungsteam, QS"
      : "Customer, Development team, QA"
  );

  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize with default phases only on client-side to use crypto.randomUUID
    setPhases([
      {
        id: crypto.randomUUID(),
        name: language === "de" ? "Planung" : "Planning",
        startDate: "2024-01-01",
        endDate: "2024-01-15",
      },
      {
        id: crypto.randomUUID(),
        name: language === "de" ? "Entwicklung" : "Development",
        startDate: "2024-01-16",
        endDate: "2024-03-15",
      },
    ]);
  }, [language]);

  const handleAddPhase = () => {
    if (!isMounted) return;
    setPhases([
      ...phases,
      { id: crypto.randomUUID(), name: "", startDate: "", endDate: "" },
    ]);
  };

  const handleRemovePhase = (id: string) => {
    setPhases(phases.filter((phase) => phase.id !== id));
  };

  const handlePhaseChange = (
    id: string,
    field: keyof Omit<ProjectPhase, "id">,
    value: string
  ) => {
    setPhases(
      phases.map((phase) =>
        phase.id === id ? { ...phase, [field]: value } : phase
      )
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isMounted) return; // Prevent submission if not mounted (crypto not available)
    const data: ProjectData = {
      projectName,
      projectGoal,
      mainComponents: mainComponentsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stakeholders: stakeholdersStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      phases,
    };
    onSubmit(data);
  };

  if (!isMounted) {
    // Optional: render a loader or null while waiting for client-side mount
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-md"></div>
        <div className="h-20 bg-muted rounded-md"></div>
        <div className="h-10 bg-muted rounded-md"></div>
        <div className="h-10 bg-muted rounded-md"></div>
        <div className="h-10 bg-muted rounded-md w-full mt-4"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="projectName" className="mb-1 block">
          {t("form.projectName")}
        </Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={
            language === "de"
              ? "z.B. E-Commerce Plattform"
              : "e.g. E-Commerce Platform"
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="projectGoal" className="mb-1 block">
          {t("form.projectGoal")}
        </Label>
        <Textarea
          id="projectGoal"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
          placeholder={
            language === "de"
              ? "z.B. Einen neuen Online-Shop starten"
              : "e.g. Launch a new online shop"
          }
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="mainComponents" className="mb-1 block">
          {t("form.mainComponents")}
        </Label>
        <Input
          id="mainComponents"
          value={mainComponentsStr}
          onChange={(e) => setMainComponentsStr(e.target.value)}
          placeholder={
            language === "de"
              ? "z.B. API, Web App, Mobile App"
              : "e.g. API, Web App, Mobile App"
          }
        />
      </div>
      <div>
        <Label htmlFor="stakeholders" className="mb-1 block">
          {t("form.stakeholders")}
        </Label>
        <Input
          id="stakeholders"
          value={stakeholdersStr}
          onChange={(e) => setStakeholdersStr(e.target.value)}
          placeholder={
            language === "de"
              ? "z.B. Product Owner, Marketing Team, Benutzer"
              : "e.g. Product Owner, Marketing Team, Users"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("form.phases")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className="p-4 border rounded-lg space-y-3 bg-muted/30 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-md">
                  {t("form.phase")} {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePhase(phase.id)}
                  aria-label="Phase entfernen"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label
                  htmlFor={`phaseName-${phase.id}`}
                  className="mb-1 block text-sm"
                >
                  {t("form.phaseName")}
                </Label>
                <Input
                  id={`phaseName-${phase.id}`}
                  value={phase.name}
                  onChange={(e) =>
                    handlePhaseChange(phase.id, "name", e.target.value)
                  }
                  placeholder={
                    language === "de"
                      ? "z.B. Design Sprint"
                      : "e.g. Design Sprint"
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`phaseStart-${phase.id}`}
                    className="mb-1 block text-sm"
                  >
                    {t("form.startDate")}
                  </Label>
                  <Input
                    id={`phaseStart-${phase.id}`}
                    type="date"
                    value={phase.startDate}
                    onChange={(e) =>
                      handlePhaseChange(phase.id, "startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`phaseEnd-${phase.id}`}
                    className="mb-1 block text-sm"
                  >
                    {t("form.endDate")}
                  </Label>
                  <Input
                    id={`phaseEnd-${phase.id}`}
                    type="date"
                    value={phase.endDate}
                    onChange={(e) =>
                      handlePhaseChange(phase.id, "endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPhase}
            className="w-full mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("form.addPhase")}
          </Button>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 text-base"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          t("form.generate")
        )}
      </Button>
    </form>
  );
}
