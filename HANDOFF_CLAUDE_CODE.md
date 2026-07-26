# Claude-Code-Handoff: Flurfunk / Nachbarschafts-App

Stand: 26.07.2026

Dieses Dokument ist der Kontext-Transfer für die Weiterarbeit mit Claude Code. Bitte zuerst komplett lesen, bevor Änderungen gemacht werden. Der Chatverlauf ist lang; dieses Dokument soll Claude schnell handlungsfähig machen.

## Projektziel

Flurfunk ist eine mobile-first PWA für eine einzelne Straße/Nachbarschaft. Es soll kein großes Social Network werden, sondern ein kleines, verständliches Werkzeug für echte Nachbarn:

- Einladungen per Code und E-Mail
- Haushalt/Profil/Onboarding
- Wer ist zuhause, Urlaub, Kinder-Status
- Straßen-Feed, Hilfe, Hinweise
- Events mit RSVP
- Kalender mit Kategorien, Farben und Serien
- Push-Benachrichtigungen
- Adminbereich für Rollout, Nutzer, Inhalte, Push-Tests und Systemstatus

Ziel-URL: `https://www.red-it.org/apps/neighborhood/`

## Wichtige Arbeitsregeln vom Nutzer

- Keine Deploys durch die KI, außer der Nutzer fordert es ausdrücklich. Der Nutzer deployed normalerweise selbst.
- Keine Build-Checks automatisch ausführen, außer der Nutzer fordert es ausdrücklich. Also kein `npm run build`, kein `npm run deploy`.
- Leichte Checks sind ok: `git diff --check`, gezielte `rg`, Dateigrößen, PHP-Syntax nur wenn PHP geändert wurde.
- Alles UTF-8, echte Umlaute verwenden: `ä`, `ö`, `ü`, `ß`.
- Atomic Design beachten: `atoms`, `molecules`, `organisms`, `templates`, `pages`.
- Dateien möglichst unter 500 Zeilen halten.
- Mobile-first arbeiten, grob drei Breakpoint-Ebenen beachten.
- Einheitliche Atome/Molecules verwenden. Keine parallelen Button-, Card-, Modal- oder Header-Varianten bauen.
- Bestehende UX nicht durch CSS-Fixes an anderer Stelle kaputtmachen. Besonders Login, Dashboard, mobile Navigation und Header-Hintergrund sind sensibel.
- Worktree ist stark dirty. Nichts ungefragt revertieren oder "aufräumen".
- Der Nutzer möchte größere Arbeitspakete. Nicht nach jedem Mini-Schritt fragen, sondern sinnvoll 20-30 Minuten bündeln und dann berichten.

## Tech-Stack

Frontend:

- React 18
- Vite
- TypeScript
- React Router
- Vite PWA / Workbox InjectManifest
- FullCalendar für Kalenderansichten
- eigenes Design-System unter `src/design-system/`

Backend:

- PHP 8.x ohne Framework
- Mini-MVC: `api/controllers`, `api/models`, `api/core`
- SQLite über PDO
- Migrationen unter `api/migrations/`
- Sessions statt JWT

Deployment:

- `npm run deploy` baut und lädt per FTP hoch.
- Nutzer deployed normalerweise selbst.
- Migrationen laufen serverseitig beim echten API-Request automatisch über `api/core/Database.php`.
- Wenn neue Migrationen hinzukommen: dem Nutzer explizit sagen, dass nach Deploy ein API-Request nötig ist, damit sie live angewendet werden.

## Lokales Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Lokales Frontend spricht üblicherweise gegen die Live-API. Vite-Basis ist `/apps/neighborhood/`, siehe `vite.config.ts`.

Wichtige Scripts:

```bash
npm run dev
npm run build
npm run deploy
```

`build` und `deploy` nur nach ausdrücklicher Freigabe.

## Architekturüberblick

Frontend:

- `src/api/`: API-Wrapper
- `src/components/atoms/`: Basis-UI wie Button, Input, Textarea, Icons, Pills
- `src/components/molecules/`: wiederverwendbare UI-Kompositionen, z.B. Cards, Dialoge, Admin-Karten
- `src/components/organisms/`: Feature-Blöcke und komplexe Listen/Formulare
- `src/components/templates/`: Seitenlayouts
- `src/pages/`: Routenseiten
- `src/routes/AppRoutes.tsx`: Routing
- `src/context/`: Auth, Theme, Feature Flags
- `src/design-system/`: CSS pro Feature/Domain
- `src/types/`: geteilte Frontend-Typen
- `src/utils/`: Labels, Datum, Metadaten

Backend:

- `api/index.php`: Router
- `api/controllers/`: Controller pro Domäne
- `api/models/`: Datenzugriff
- `api/core/Database.php`: SQLite + Migrationen
- `api/core/MailService.php`: E-Mail-Versand
- `api/core/WeeklyDigest*`: Digest-Vorschau/Versand
- `api/migrations/`: Schemaänderungen

## Wichtige UI-Bausteine

Bitte bevorzugt wiederverwenden:

- `Button`
- `Input`
- `Textarea`
- `StatusPill`
- `ConfirmDialog`
- `AdminSection`
- `AdminContentCard`
- `IconBadge`
- `FeatureIcon`
- `DashboardTemplate`
- Header-Daten über `src/content/pageHeaders.ts`

CSS ist bewusst in Feature-Dateien getrennt:

- `app-layout.css`
- `app-hero.css`
- `dashboard.css`
- `auth.css`
- `calendar.css`
- `events.css`
- `feed.css`
- `help-board.css`
- `neighbors.css`
- `admin.css`
- `admin-invites.css`
- `admin-users.css`
- `admin-content.css`
- `admin-digest.css`
- `profile-settings.css`
- `onboarding.css`

## Aktueller Funktionsstand

Funktioniert bzw. weitgehend implementiert:

- Login/Logout
- Einladungscode-Registrierung
- Adminbereich
- Haushalte anlegen/löschen
- Nutzerverwaltung mit Self-Delete-Schutz im Adminbereich
- Einladungscodes pro Haushalt
- Einladung per E-Mail mit Name, E-Mail und Code
- PWA installierbar
- Push-Abo, Push-Test im Adminbereich
- Dashboard mit Haushaltsstatus, Schnellaktionen, Status/Urlaub/Kinder/Kalender/Hinweisen
- Onboarding-/Startmodus mit Zwischenspeichern
- Profil/Selbstverwaltung teilweise
- Nachbarschaftsverzeichnis
- Straßen-Feed mit Reaktionen/Kommentaren
- Hilfe/Schwarzes Brett als Feed-basierte Sicht
- Events mit RSVP
- Kalender mit Kategorien/Farben, Edit/Delete, Serien/Wiederholung
- Admin-Systemstatus
- Wöchentlicher Digest als Admin-Vorschau/Test
- Dark Mode deutlich verbessert
- Error Boundary vorhanden

## Zuletzt bearbeiteter Bereich

Direkt vor dieser Übergabe wurde der Admin-Contentbereich refactored:

- Neue Molecule: `src/components/molecules/AdminContentCard.tsx`
- Neues CSS: `src/design-system/admin-content.css`
- Umgebaut:
  - `AdminFeedList`
  - `AdminEventList`
  - `AdminCalendarList`
  - `AdminNoticePanel`
- AdminContent nutzt jetzt einheitliche Karten/Pills statt Inline-Styles.
- `AdminSystemStatusPanel`, Event-/Feed-/Kalender-Metadaten und Visibility-Texte wurden auf sauberes UTF-8 gebracht.

Checks dazu:

- Kein Build/Deploy ausgeführt.
- `git diff --check` war sauber.
- Betroffene Dateien liegen unter 500 Zeilen.
- UTF-8/Mojibake-Check für betroffene Dateien ohne Treffer.

## Aktueller Worktree-Hinweis

Der Worktree ist bewusst stark dirty. Viele Änderungen sind noch nicht committed und einige neue Dateien sind untracked. Nicht aufräumen/reverten ohne explizite Freigabe.

Wichtige neue/untracked Dateien, die wahrscheinlich zum aktuellen Stand gehören:

- `api/controllers/AdminDigestController.php`
- `api/core/MailService.php`
- `api/core/WeeklyDigestFormatter.php`
- `api/core/WeeklyDigestService.php`
- `api/migrations/014_...` bis `023_...`
- `src/components/molecules/AdminContentCard.tsx`
- `src/components/molecules/AppErrorBoundary.tsx`
- `src/components/molecules/NeighborCard.tsx`
- `src/components/organisms/AdminDigestPanel.tsx`
- `src/components/organisms/AdminSystemStatusPanel.tsx`
- `src/components/organisms/EmailNotificationSettings.tsx`
- `src/components/organisms/NeighborsGrid.tsx`
- `src/components/organisms/ProfileSettings.tsx`
- `src/design-system/admin-content.css`
- `src/design-system/admin-digest.css`
- `src/design-system/admin-invites.css`
- `src/design-system/admin-users.css`
- `src/design-system/error-boundary.css`
- `src/design-system/feed.css`
- `src/design-system/help-board.css`
- `src/design-system/neighbors.css`
- `src/design-system/profile-settings.css`
- `src/pages/HelpBoardPage.tsx`
- `src/pages/NeighborsPage.tsx`
- `src/types/neighbor.ts`
- `src/utils/recurrenceLabels.ts`

Temporäre Screenshots liegen ebenfalls herum: `tmp-mobile-*.png`. Nicht automatisch löschen, aber später beim Commit bewusst prüfen.

## Sensible Stellen

### Hintergrundbilder und Header

Das Hintergrundbild war mehrfach problematisch. Nutzer möchte:

- Dashboard-Darstellung als Referenz.
- Header auf allen App-Seiten möglichst einheitlich.
- Kein doppeltes Hintergrundbild.
- Kein sichtbarer abgeschnittener Rand links.
- Login-Hintergrund vollflächig, mobile nicht kaputt machen.

Vor CSS-Änderungen hier unbedingt vorhandene Struktur lesen:

- `DashboardTemplate`
- `app-layout.css`
- `app-hero.css`
- `dashboard.css`
- `auth.css`

### Mobile Navigation

Mobile Bottom Navigation soll sticky bottom sein. Frühere mobile Icons waren gewünscht und sollten nicht durch andere Icons ersetzt werden.

### Buttons / Hover

Buttons dürfen bei Hover nicht nach oben springen. Früher verschwand dadurch ein 1px-Rand. Einheitliche Button-Atoms verwenden.

### Admin/Nutzer löschen

Self-Delete-Schutz ist wichtig:

- Admin darf sich im Adminbereich nicht selbst löschen/demoten.
- Löschdialoge beibehalten.
- Server muss Schutz ebenfalls erzwingen.
- Beim Löschen von Haushalten/Nutzern keine verwaisten Datensätze erzeugen.

### Sichtbarkeit / Privacy

Sichtbarkeits-Level sind fachlich wichtig und dürfen nicht aufgeweicht werden:

- Öffentlich
- Nur Nachbarn
- Privat

Diese Logik betrifft Status, Urlaub, Kinder, Events und Nachbarschaftsverzeichnis. Wenn etwas öffentlich angezeigt wird, immer prüfen, ob die Visibility-Regeln gelten.

## Bekannte Audit-Punkte

Bereits behoben/verifiziert laut bisherigem Verlauf:

- Haushalt-Anlegen-Crash
- Feed-Sackgasse
- Dashboard blendet Feed-Aktionen abhängig von Feature-Flag aus
- Push-Status zeigt Rückmeldung
- Dark Mode deutlich besser
- React-Router-Warnungen beseitigt
- RSVP-500er wurde später laut Nutzer/QA behoben
- Veralteter Dashboard-Hinweis wurde auf neutralen Fallback umgestellt
- Nutzer-Löschen-Route war zeitweise nicht live; bei Backend-Änderungen immer nach Deploy vom Nutzer live verifizieren lassen

Im Blick behalten:

- Gelegentlicher Doppelklick beim Logout wurde einmal beobachtet, aber nicht zuverlässig reproduziert.
- Admin-Mobile-Ansichten sollten weiter geprüft/geglättet werden.
- Einige ältere Dateien wie README/Docs können noch Mojibake enthalten. Neue oder touchierte Dateien bitte immer UTF-8 sauber halten.

## Roadmap / nächste Features

Priorität 1:

1. Echtes Nachbarschaftsverzeichnis weiter ausbauen
   - Sichtbarkeit pro Feld respektieren.
   - Mehrwert für Nachbarn klar machen.
   - Gute Such-/Filter-/Kontakt-UX.

2. Feed/Reaktionen/Kommentare weiter abrunden
   - Engagement und UX.
   - Hilfe/Schwarzes Brett als echte Alltagssicht.

3. Profil/Selbstverwaltung ausbauen
   - Name/Profilbild ändern.
   - Passwort ändern.
   - Konto löschen / DSGVO sauber.
   - Nicht mit Admin-Self-Delete-Schutz verwechseln.

Priorität 2:

4. Weekly Digest härten
   - Aktuell Admin-seitig vorhanden.
   - Später Cron/regelmäßiger Versand.

5. Wiederkehrende Kalendertermine weiter härten
   - UI/Detailansicht/Serienlogik testen.

6. Schwarzes Brett / Nachbarschaftshilfe ausbauen
   - Verleihen, Tauschen, Helfen, Urlaubshilfe.

Priorität 3:

7. Foto-Uploads in Feed und Events.

8. Rolle "Straßensprecher"
   - Moderation ohne vollen Adminzugriff.

9. Willkommens-Automatismus
   - Begrüßungspost nach Registrierung.

## Empfohlener nächster Arbeitsblock

Für maximale Effizienz als nächstes:

1. Adminbereich mobil komplett prüfen und glätten:
   - Tabs horizontal scrollbar
   - Search/Formulare
   - Haushalte/Einladungen/Nutzer/Inhalte/Kalender/System
   - Buttonbreiten, Kartenabstände, keine Überläufe

2. Danach gezielter UX-Durchlauf normaler Nutzer:
   - Einladung erhalten
   - registrieren
   - Onboarding abschließen/zwischenspeichern
   - Status setzen
   - Event planen + RSVP
   - Feed/Hilfe nutzen
   - Profil/Einstellungen prüfen

3. Danach Commit vorbereiten:
   - untracked Projektdateien reviewen
   - temporäre Screenshots bewusst entscheiden
   - keine Secrets committen
   - kein Build erzwingen, falls Nutzer es nicht will

## Nützliche Check-Kommandos

Ohne Build:

```powershell
git diff --check
# Mojibake-Suche bei Bedarf gezielt ergänzen, z.B. nach typischen falsch dekodierten Umlauten.
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.css | ForEach-Object {
  $lines = (Get-Content -Path $_.FullName).Count
  if ($lines -gt 500) { "$lines $($_.FullName)" }
}
```

Wenn PHP geändert wurde:

```powershell
php -l api/controllers/AdminController.php
php -l api/index.php
```

Nur wenn Nutzer explizit freigibt:

```powershell
npm run build
npm run deploy
```

## Kommunikation mit dem Nutzer

Der Nutzer möchte effizientere, größere Arbeitspakete. Nicht nach jedem Mini-Schritt fragen. Besser:

- 20-30 Minuten sinnvoll zusammenhängend arbeiten.
- Danach kurz sagen:
  - was geändert wurde
  - welche Checks liefen
  - was nicht gemacht wurde
  - was der nächste logische Schritt ist

Sprache: Deutsch, direkt, pragmatisch.
