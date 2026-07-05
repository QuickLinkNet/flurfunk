# Nachbarn – Straßenplaner

PWA für eine Straße/Nachbarschaft. React + Vite + TypeScript (Atomic Design) im Root,
PHP 8.x Mini-MVC (natives PDO, keine Composer-Pakete) in `api/`.
Datenbank: SQLite (eine Datei, kein separater Server nötig – reicht für eine
einzelne Straße mit 5–40 Haushalten locker aus).
Ziel-URL: **https://www.red-it.org/apps/neighborhood/**
Vollständiges Konzept: siehe `PRD_Nachbarschafts-App.md`.

## Einmalige Einrichtung (nur beim allerersten Mal)

Dieser Schritt macht `npm run deploy` **bewusst nicht** automatisch – er
betrifft eine Datei, die nicht bei jedem Deploy erneut angefasst werden soll.

**`api/config.php` direkt auf dem Server anlegen**
Nicht lokal erstellen, nicht hochladen! Per FTP-Programm (z.B. FileZilla) oder
dem Datei-Manager deines Hosting-Panels direkt in
`/apps/neighborhood/api/config.php` den Inhalt aus `api/config.example.php`
kopieren – die Standardwerte funktionieren unverändert, da SQLite keine
Zugangsdaten braucht (nur ein Dateipfad, kein Nutzer/Passwort):

```php
<?php
return [
    'db' => [
        'path' => __DIR__ . '/data/database.sqlite',
    ],
    'session_name' => 'nachbarn_session',
    'cors_origin' => null,
];
```

Das Deploy-Skript prüft sogar aktiv, dass diese Datei **nicht** lokal in
deinem Projektordner liegt, und bricht sonst ab – so kann sie nie versehentlich
überschrieben oder mit hochgeladen werden.

Die Datenbank-Tabellen müssen **nicht** manuell angelegt werden: Die App führt
alle noch nicht angewendeten Dateien aus `api/migrations/` automatisch beim
ersten echten Request aus (siehe `api/core/Database.php`). Die SQLite-Datei
selbst liegt unter `api/data/` und ist dort per `.htaccess` vor direktem
Web-Zugriff geschützt.

**Deploy-Zugangsdaten lokal hinterlegen**
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
| `.env.deploy` | lokal bei dir | FTP-Zugangsdaten für `npm run deploy` | Nein (gitignored) |
| `api/config.php` | **nur auf dem Server** | SQLite-Dateipfad, Session-Name | Nein, wird aktiv blockiert |
| `api/config.example.php` | Repo | Vorlage/Dokumentation | Ja (enthält keine Geheimnisse) |

## Status

Registrierung (mit Einladungscode, erster Nutzer wird automatisch Admin),
Login, Dashboard, Straßen-Feed, Kalender (Listenansicht), Kinderverwaltung
und Events mit RSVP sind als klickbare UI vorhanden und gegen die echten
API-Endpunkte verdrahtet. Der volle v1.0-Funktionsumfang ist in
`PRD_Nachbarschafts-App.md` Kapitel 3 beschrieben; offen ist u.a. eine eigene
Einstellungen/Sichtbarkeit-Seite.
