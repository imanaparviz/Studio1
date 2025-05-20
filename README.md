# Roadmap Weaver

Ein Tool zum Erstellen von Projekt-Mindmaps, Roadmaps und Pflichtenheft-Dokumentation.

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Für die Nutzung der Google Gemini AI API müssen Sie die folgenden Umgebungsvariablen konfigurieren:

### Für lokale Entwicklung

Erstellen Sie eine Datei `.env.local` im Stammverzeichnis mit dem folgenden Inhalt:

```
GOOGLE_AI_API_KEY=dein_google_gemini_api_key
NEXT_PUBLIC_DEFAULT_LANGUAGE=de
```

### Für Vercel Deployment

Fügen Sie die gleichen Umgebungsvariablen in den Projekteinstellungen auf der Vercel-Plattform hinzu:

1. Gehen Sie zu Ihrem Projekt auf vercel.com
2. Navigieren Sie zu "Settings" > "Environment Variables"
3. Fügen Sie `GOOGLE_AI_API_KEY` mit Ihrem Google Gemini API-Schlüssel hinzu
4. Optional: Fügen Sie `NEXT_PUBLIC_DEFAULT_LANGUAGE` hinzu, um die Standardsprache zu ändern

## Entwicklung

```bash
# Start development server
npm run dev
```

## Deployment auf Vercel

```bash
# Installieren Sie die Vercel CLI, falls noch nicht geschehen
npm install -g vercel

# Anmelden bei Vercel
vercel login

# Deployment (Verwenden Sie die Windows PowerShell-Skriptdatei)
./scripts/deploy-to-vercel.ps1

# Für Produktionsdeploy
./scripts/deploy-to-vercel.ps1 --prod
```

**Wichtig:** Ihr API-Schlüssel wird sicher in den Vercel-Umgebungsvariablen gespeichert und ist nicht im Client-Code verfügbar oder sichtbar.

## Sicherheitshinweise

- Commit NIE Ihren tatsächlichen API-Schlüssel in das Repository
- Die Anwendung ist so konfiguriert, dass der API-Schlüssel nur serverseitig verwendet wird
- Alle API-Anfragen werden über Server-Komponenten oder Server-Aktionen abgewickelt
- Verwenden Sie immer die Umgebungsvariablen von Vercel für die Produktion

# Studio1
