# Nachbarn – Straßenplaner

PWA für eine Straße/Nachbarschaft. React + Vite + TypeScript (Atomic Design) im Root,
PHP 8.x Mini-MVC (natives PDO, keine Composer-Pakete) in `api/`.
Datenbank: SQLite (eine Datei, kein separater Server nötig – reicht für eine
einzelne Straße mit 5–40 Haushalten locker aus).
Ziel-URL: **https://www.red-it.org/apps/neighborhood/**
Vollständiges Konzept: siehe `PRD_Nachbarschafts-App.md`.

## Einmalige Einrichtung (nur beim allerersten Mal)

Seit dem Umstieg auf SQLite gibt es genau einen manuellen Schritt: die
FTP-Zugangsdaten lokal eintragen.

```bash
cp .env.deploy.example .env.deploy
```

Dann in `.env.deploy` eintragen: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
(aus deinem Hosting-Panel für www.red-it.org). `REMOTE_BASE_DIR` nur ändern,
falls der Zielordner wirklich anders heißen soll.

`api/config.php` und die Datenbank-Tabellen brauchen **keine** manuellen
Schritte mehr: `config.php` wird ganz normal mitdeployed (enthält seit SQLite
keine Zugangsdaten mehr, nur einen Dateipfad), und `api/core/Database.php`
führt alle noch nicht angewendeten Dateien aus `api/migrations/` automatisch
beim ersten echten Request aus. Die SQLite-Datei selbst entsteht dabei unter
`api/data/` und ist dort per `.htaccess` vor direktem Web-Zugriff geschützt.

## Deployment

Danach reicht für jedes weitere Update:

```bash
npm install
npm run deploy
```

Das baut das Frontend (`npm run build`) und lädt es per FTP/FTPS hoch:
`dist/` → `/apps/neighborhood/`, `api/` → `/apps/neighborhood/api/`.
Das Skript (`scripts/deploy.mjs`) fasst **ausschließlich** diesen einen
Ordner an: Es wandert von deinem FTP-Login-Verzeichnis gezielt in
`/apps/neighborhood`, legt dort höchstens fehlende Unterordner an und
löscht nur den generierten `assets/`-Ordner (alte Vite-Bundles) neu – nichts
außerhalb, nichts in Geschwister-Verzeichnissen. Die SQLite-Datenbankdatei
selbst (`api/data/*.sqlite`) liegt nicht lokal vor und wird deshalb beim
Hochladen nie berührt – deine Live-Daten bleiben unangetastet.

## Lokale Entwicklung

Kein lokales PHP/DB-Setup nötig – das Frontend spricht direkt mit dem Live-Backend.

```bash
npm install
cp .env.local.example .env.local   # zeigt auf https://www.red-it.org/apps/neighborhood/api
npm run dev
```

Für Backend-Änderungen: PHP-Dateien lokal editieren, mit `php -l datei.php` auf
Syntaxfehler prüfen, dann `npm run deploy` (lädt automatisch auch `api/` mit hoch).

## Projektstruktur

```
src/            React-Frontend (Atomic Design: atoms/molecules/organisms/templates/pages)
api/            PHP-Backend (Mini-MVC: core/controllers/models/migrations)
public/         Statische Assets, PWA-Manifest, Icons
scripts/        Deploy-Skript (scripts/deploy.mjs) + .env-Loader
.htaccess       SPA-Fallback für den Root (api/ bleibt ausgenommen)
```

## Konfigurationsübersicht (wo trage ich was ein?)

| Datei | Wo | Wofür | Wird deployed? |
|---|---|---|---|
| `.env.local` | lokal bei dir | Frontend-Dev zeigt auf Live-API | Nein (gitignored) |
| `.env.local.example` | Repo | Vorlage für `.env.local` | Ja (enthält keine Geheimnisse) |
| `.env.deploy` | lokal bei dir | FTP-Zugangsdaten für `npm run deploy` | Nein (gitignored) |
| `.env.deploy.example` | Repo | Vorlage für `.env.deploy` | Ja (enthält keine Geheimnisse) |
| `api/config.php` | Repo | SQLite-Dateipfad, Session-Name | Ja (enthält seit SQLite keine Geheimnisse mehr) |

## Status

Registrierung (mit Einladungscode, erster Nutzer wird automatisch Admin),
Login, Dashboard, Straßen-Feed, Kalender (Listenansicht), Kinderverwaltung
und Events mit RSVP sind als klickbare UI vorhanden und gegen die echten
API-Endpunkte verdrahtet. Der volle v1.0-Funktionsumfang ist in
`PRD_Nachbarschafts-App.md` Kapitel 3 beschrieben; offen ist u.a. eine eigene
Einstellungen/Sichtbarkeit-Seite.
