# Nachbarn – Straßenplaner

PWA für eine Straße/Nachbarschaft. React + Vite + TypeScript (Atomic Design) im Root,
PHP 8.x Mini-MVC (natives PDO, keine Composer-Pakete) in `api/`.
Ziel-URL: **https://www.red-it.org/apps/neighborhood/**
Vollständiges Konzept: siehe `PRD_Nachbarschafts-App.md`.

## Einmalige Einrichtung (nur beim allerersten Mal)

Diese drei Schritte macht `npm run deploy` **bewusst nicht** automatisch – sie
betreffen Zugangsdaten bzw. Datenbank-Struktur und sollen nicht bei jedem
Deploy erneut angefasst werden.

**1. `api/config.php` direkt auf dem Server anlegen**
Nicht lokal erstellen, nicht hochladen! Per FTP-Programm (z.B. FileZilla) oder
dem Datei-Manager deines Hosting-Panels direkt in
`/apps/neighborhood/api/config.php` folgende Datei anlegen (Inhalt aus
`api/config.example.php` kopieren und mit echten Werten füllen):

```php
<?php
return [
    'db' => [
        'host' => '127.0.0.1',       // von deinem Hoster vorgegeben
        'name' => 'dein_db_name',
        'user' => 'dein_db_user',
        'pass' => 'dein_db_passwort',
        'charset' => 'utf8mb4',
    ],
    'session_name' => 'nachbarn_session',
    'cors_origin' => null,
];
```

Das Deploy-Skript prüft sogar aktiv, dass diese Datei **nicht** lokal in
deinem Projektordner liegt, und bricht sonst ab – so kann sie nie versehentlich
überschrieben oder mit hochgeladen werden.

**2. Datenbank-Tabellen einmalig anlegen**
Über phpMyAdmin/Adminer im Hosting-Panel die Dateien aus `api/migrations/`
der Reihe nach ausführen (`001_streets.sql`, `002_households.sql`, …).

**3. Deploy-Zugangsdaten lokal hinterlegen**
Bei dir lokal (nicht auf dem Server):

```bash
cp .env.deploy.example .env.deploy
```

Dann in `.env.deploy` eintragen: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
(aus deinem Hosting-Panel für www.red-it.org). `REMOTE_BASE_DIR` nur ändern,
falls der Zielordner wirklich anders heißen soll.

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
außerhalb, nichts in Geschwister-Verzeichnissen. `api/config.php` wird nie
angerührt, da die Datei lokal per Guard-Check ausgeschlossen ist.

## Lokale Entwicklung

Kein lokales PHP/MySQL nötig – das Frontend spricht direkt mit dem Live-Backend.

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
| `.env.deploy` | lokal bei dir | FTP-Zugangsdaten für `npm run deploy` | Nein (gitignored) |
| `api/config.php` | **nur auf dem Server** | echte DB-Zugangsdaten | Nein, wird aktiv blockiert |
| `api/config.example.php` | Repo | Vorlage/Dokumentation | Ja (enthält keine Geheimnisse) |

## Status

Login, Dashboard, Straßen-Feed, Kalender (Listenansicht) und Kinderverwaltung
sind als klickbare UI vorhanden und gegen die echten API-Endpunkte verdrahtet.
Der volle v1.0-Funktionsumfang ist in `PRD_Nachbarschafts-App.md` Kapitel 3
beschrieben; offen sind u.a. Events mit RSVP und eine eigene
Einstellungen/Sichtbarkeit-Seite.
