"use client";

import { useLanguage } from "../providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t("lang.switch")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={language === "de" ? "bg-primary/10" : ""}
          onClick={() => setLanguage("de")}
        >
          {t("lang.de")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={language === "en" ? "bg-primary/10" : ""}
          onClick={() => setLanguage("en")}
        >
          {t("lang.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
