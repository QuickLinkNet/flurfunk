# Handoff für Claude Code – Nachbarn-App

Dieses Projekt wurde bisher in Cowork (Claude Desktop) geplant und als
Grundgerüst gebaut. Ab jetzt wird lokal mit Claude Code weitergearbeitet.
Dieses Dokument ist der Kontext-Transfer – bitte zuerst komplett lesen.

## Zuerst lesen (in dieser Reihenfolge)

1. `PRD_Nachbarschafts-App.md` – vollständige Spec: Vision, Featureliste, MVP-Scope,
   Datenbankmodell, Rollenmodell, UI-Konzept, API-Konzept, Roadmap v1.0–v3.0.
2. `README.md` – Setup, Deployment-Ablauf, wo welche Config-Datei hingehört.

## Sofort zu erledigen

**1. Aufräumen.** Im Projektordner liegen noch Arbeitsreste aus der Cowork-Session
(interne Zwischenkopien zur Fehlerbehebung, keine echten Projektdateien). Bitte löschen:

- Alle Dateien, die mit `_sync_` oder `_sync2_` beginnen
- `testfile.tmp`
- `ziHynyI8`
- `nachbarn-app-grundgeruest.zip`, `nachbarn-app-grundgeruest-v2.zip`,
  `nachbarn-app-grundgeruest-v3.zip`, `nachbarn-app-grundgeruest-v4.zip`,
  `nachbarn-app-v5.zip`, `nachbarn-app-v6.zip` (alles Zwischenstände, der
  Ordner selbst ist jetzt der aktuelle Stand)

`.idea/` bitte **nicht** löschen (lokale PhpStorm-Konfiguration des Nutzers),
ist bereits in `.gitignore` sauber ausgeschlossen.

**2. Git initialisieren.**

```bash
git init
git add .
git commit -m "Initial commit"
```

**3. Lokal verifizieren**, was in der Cowork-Sandbox nicht möglich war (kein
Internetzugriff zu npm, kein PHP installiert):

```bash
npm install
npm run dev            # gegen das Live-Backend, siehe .env.local.example
find api -name "*.php" -exec php -l {} \;   # Syntax-Check aller PHP-Dateien
```

## Aktueller Funktionsstand

**Fertig (Backend-API + UI verdrahtet):**
Login/Registrierung, Dashboard (Haushaltsstatus-Übersicht), Straßen-Feed
(8 MVP-Post-Typen), Kalender (Listenansicht mit Monatsnavigation),
Kinderverwaltung (Aufenthaltsort ändern), Sichtbarkeits-Einstellungen
(nur Backend-Endpoint, noch keine UI).

**Noch offen:**
- Events-Seite mit RSVP (Zusage/Vielleicht/Absage, "kommt mit allen"/"nur Thomas") –
  Backend-Endpoints für Events fehlen noch komplett (Model + Controller analog
  zu `FeedController`/`FeedItem` anlegen)
- Einstellungen-Seite (Sichtbarkeit pro Feld einstellen) – `visibilityApi.ts`
  existiert bereits im Frontend, es fehlt nur die Seite/UI dazu
- Echte PWA-Icons (`public/icons/icon-192.png`, `icon-512.png` sind nur als
  Platzhalter-Hinweis in `public/icons/README.txt` dokumentiert)
- Erster echter Deploy-Test gegen `www.red-it.org/apps/neighborhood`

## Feste Architektur-Entscheidungen (bitte respektieren, nicht neu diskutieren)

- **Frontend:** React + Vite + TypeScript, Atomic Design
  (`atoms/molecules/organisms/templates/pages`), jede Datei < 500 Zeilen.
  Minimale Dependencies: nur `react`, `react-dom`, `react-router-dom`,
  `vite-plugin-pwa`.
- **Backend:** PHP 8.x nativ, **kein Composer, kein Framework**, Mini-MVC
  (`core/controllers/models`), MySQL nativ über PDO, keine ORM.
- **Auth:** PHP-native Sessions (kein JWT), da Frontend + API auf derselben
  Domain liegen.
- **Deployment-Ziel:** `https://www.red-it.org/apps/neighborhood/` – Root =
  Frontend-Build, `api/` = Backend. Ausschließlich per `npm run deploy`
  (FTP/FTPS über `scripts/deploy.mjs`), fasst laut Nutzeranforderung **nie**
  etwas außerhalb dieses einen Ordners an.
- **`api/config.php` existiert nie lokal**, nur direkt auf dem Server (echte
  DB-Zugangsdaten). Das Deploy-Skript bricht aktiv ab, falls die Datei doch
  lokal auftaucht.

## Empfohlene nächste Schritte

1. Aufräumen + `git init` (s.o.)
2. Lokale Verifikation (`npm install`, `npm run dev`, `php -l`)
3. Events-Backend (Model + Controller, Routen in `api/index.php` ergänzen)
   + Events-Seite mit RSVP im Frontend
4. Einstellungen-Seite (Sichtbarkeit) im Frontend
5. Echte Icons erzeugen und in `public/icons/` ablegen
6. Einmalige Server-Einrichtung (siehe README: `config.php` auf dem Server
   anlegen, Migrationen einspielen, `.env.deploy` lokal befüllen)
7. Erster `npm run deploy` gegen die echte Domain
