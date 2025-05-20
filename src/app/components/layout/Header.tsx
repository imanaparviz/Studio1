"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { GitFork } from "lucide-react";
import { LanguageSelector } from "../LanguageSelector";
import { useLanguage } from "@/app/providers/LanguageProvider";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-auto">
          <GitFork className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">{t("app.title")}</span>
        </Link>
        <nav className="flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
