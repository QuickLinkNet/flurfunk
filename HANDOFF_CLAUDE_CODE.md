# Claude-Code-Handoff: Flurfunk / Nachbarschafts-App

Stand: 09.08.2026

Dieses Dokument ist der Kontext-Transfer für die Weiterarbeit mit Claude Code. Bitte zuerst komplett lesen, bevor Änderungen gemacht werden.

## Projektziel

Flurfunk ist eine mobile-first PWA für eine einzelne Straße/Nachbarschaft. Kein großes Social Network, sondern ein kleines, verständliches Werkzeug für echte Nachbarn:

- Einladung per Code (personalisiert) oder per Straßen-Link (selbstbedient)
- Haushalt/Profil/Onboarding
- Wer ist zuhause, Urlaub, Kinder-Status
- Straßen-Feed, Hilfe, Hinweise
- Events mit RSVP, Terminfindung (Doodle-artig), Push-Erinnerung
- Kalender mit Kategorien, Farben und Serien
- Push-Benachrichtigungen (echte verschlüsselte Payloads, nicht nur "schau rein")
- Feedback-/Bug-Kanal von Nutzern an Admins
- Adminbereich für Rollout, Nutzer, Inhalte, Push-Tests und Systemstatus

Ziel-URL: `https://www.red-it.org/apps/neighborhood/`

## Wichtige Arbeitsregeln vom Nutzer

- **Deploy: Nicht ungefragt.** Wenn der Nutzer explizit dazu auffordert (z. B. "deploy bitte"), `npm run deploy` **direkt ausführen, ohne nochmal nachzufragen**. Das ist eine bewusste Ausnahme von der allgemeinen "nichts automatisch ausführen"-Regel, die der Nutzer selbst eingeführt hat.
- Sonstige `npm run <script>`-Befehle (build, dev, etc.) nicht unaufgefordert ausführen.
- Leichte Checks sind immer ok: `tsc -b --noEmit`, `php -l`, `git diff --check`, gezielte Suche, Dateigrößen.
- Alles UTF-8, echte Umlaute verwenden: `ä`, `ö`, `ü`, `ß`.
- Atomic Design beachten: `atoms`, `molecules`, `organisms`, `templates`, `pages`.
- Dateien möglichst unter 500 Zeilen halten. Bei Admin-Controllern: neue Admin-Features als eigener Subcontroller (siehe Architekturüberblick), nicht in `AdminController.php` reinquetschen.
- Mobile-first arbeiten, grob drei Breakpoint-Ebenen beachten.
- Einheitliche Atome/Molecules verwenden. Keine parallelen Button-, Card-, Modal- oder Header-Varianten bauen.
- Bestehende UX nicht durch CSS-Fixes an anderer Stelle kaputtmachen. Besonders Login, Dashboard, mobile Navigation und Header-Hintergrund sind sensibel (siehe unten).
- Worktree normalerweise sauber halten: nach jedem fertigen Feature committen und pushen (siehe Workflow unten).
- Der Nutzer möchte größere, zusammenhängende Arbeitspakete und danach knappen Bericht. Nicht nach jedem Mini-Schritt fragen.
- Vor Registrierungs-/Auth-Änderungen: additiv bauen (neuer Controller/neue Route), bestehende funktionierende Flows (Code-Registrierung, Login) nicht anfassen, wenn nicht nötig.

## Etablierter Workflow pro Feature

So ist in dieser Session durchgängig gearbeitet worden, funktioniert gut:

1. Bestehenden Code/Konventionen lesen, bevor neue Dateien angelegt werden (gleiche Struktur wie Nachbarfeature verwenden).
2. Implementieren.
3. `tsc -b --noEmit` + `php -l` auf allen geänderten/neuen PHP-Dateien.
4. Live-Check im Browser (lokaler Dev-Server spricht gegen die **echte Produktions-API** - siehe Tech-Stack). Vor Deploy nur defensiv prüfbar (neue Felder mit `?? []`/optional chaining absichern, kein Crash bei fehlenden Feldern).
5. Commit mit ausführlicher, warum-fokussierter Nachricht + Push.
6. Deploy nur auf explizite Aufforderung (`npm run deploy`).
7. **Nach Deploy live durchklicken**, inkl. neuer Migrationen (siehe unten) - das ist der einzige Punkt, an dem echte End-to-End-Verifikation möglich ist.
8. Test-/Fixture-Daten wieder löschen (Test-Haushalte, Test-Events, Test-Feedback etc.).

## Tech-Stack

Frontend:

- React 18, Vite, TypeScript, React Router
- Vite PWA / Workbox InjectManifest
- FullCalendar für Kalenderansichten
- eigenes Design-System unter `src/design-system/`

Backend:

- PHP 8.x ohne Framework, eigener schlanker Autoloader (`api/index.php`)
- Mini-MVC: `api/controllers`, `api/models`, `api/core`
- SQLite über PDO, Foreign Keys aktiv
- Migrationen unter `api/migrations/`, laufen automatisch beim ersten echten API-Request nach Deploy
- Sessions statt JWT (`api/core/Auth.php`)
- Web Push: VAPID + volle RFC-8291-Verschlüsselung, handgebaut in `api/core/WebPush.php` (kein externes Paket)

**Wichtig:** Lokaler Dev-Server (`npm run dev`) spricht gegen die **Live-Produktions-API**, nicht gegen ein lokales Backend. Das heißt: neuer Backend-Code ist vor dem Deploy nicht wirklich end-to-end testbar - nur "crasht das Frontend nicht, wenn das Feld noch fehlt". Echte Verifikation erst nach Deploy live.

Deployment:

- `npm run deploy` = `tsc -b && vite build` + FTP-Upload von `dist/` und `api/` (inkl. gitignorter lokaler Dateien wie `.env.deploy`, `api/cron-token.local.php`).
- Migrationen laufen serverseitig beim ersten echten API-Request automatisch. Nach Deploy mit neuer Migration: einmal irgendeine Seite aufrufen, damit sie zieht, bevor man das Feature live testet.

## Lokales Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Vite-Basis ist `/apps/neighborhood/`, siehe `vite.config.ts`.

```bash
npm run dev
npm run build   # nur nach Freigabe
npm run deploy  # bei expliziter Aufforderung direkt ausführen
```

## Architekturüberblick

Frontend:

- `src/api/`: API-Wrapper (ein File pro Domäne, z. B. `eventPollApi.ts`, `feedbackApi.ts`, `streetJoinApi.ts`)
- `src/components/atoms/`: Basis-UI wie Button, Input, Textarea, Select, Icons, Pills
- `src/components/molecules/`: wiederverwendbare Kompositionen (Cards, Dialoge, Admin-Karten, `ActionDialog`, `ConfirmDialog`)
- `src/components/organisms/`: Feature-Blöcke, Formulare, Listen
- `src/components/templates/`: `DashboardTemplate` (Hero-Header + Content-Sheet für alle Seiten außer Dashboard selbst, das eine eigene parallele Struktur in `dashboard.css` hat - bewusst gleich gestaltet, siehe Sensible Stellen)
- `src/pages/`: Routenseiten
- `src/routes/AppRoutes.tsx`: Routing, `RequireAuth`/`RequireAdmin`/`RequireFeature`-Wrapper
- `src/context/`: Auth, Theme, Feature Flags
- `src/design-system/`: CSS pro Feature/Domain, siehe Liste unten
- `src/types/`, `src/utils/`: geteilte Typen, Labels, Datum, Metadaten

Backend:

- `api/index.php`: einziger Front-Controller, Autoloader + alle Routen
- `api/controllers/`: Controller pro Domäne. **Etabliertes Muster für Admin-Features:** eigener kleiner Subcontroller statt Erweiterung von `AdminController.php` (das liegt schon nah an 500 Zeilen). Jeder Subcontroller dupliziert bewusst seine eigene `requireAdmin()`-Methode statt eine gemeinsame Basisklasse zu nutzen - das war eine explizite Entscheidung (Unabhängigkeit der Controller wichtiger als DRY), **nicht ungefragt ändern**. Beispiele: `AdminDigestController`, `AdminFeedbackController`, `AdminStreetInviteController`.
- `api/models/`: Datenzugriff, ein Model pro Tabelle/Konzept. Öffentlich-vs-Admin-Mapping-Methoden können sich gleich nennen (`toPublicUser`), aber unterschiedliche Felder liefern (Selbstauskunft vs. Admin-Liste) - vor dem Zusammenlegen immer diffen, nicht nur am Namen orientieren.
- `api/core/`: `Database.php` (SQLite + Migrationsrunner), `Auth.php`, `PushService.php`/`WebPush.php` (Push-Versand/-Verschlüsselung), `MailService.php`, `WeeklyDigest*`, `TrashReminderService.php`
- `api/migrations/`: fortlaufend nummeriert, aktuell bis `031_event_polls.sql`

## Wichtige UI-Bausteine

Bitte bevorzugt wiederverwenden:

- `Button`, `Input`, `Textarea`, `Select`
- `StatusPill`, `ConfirmDialog`, `ActionDialog`
- `AdminSection`, `AdminContentCard`, `AdminEmptyState`
- `IconBadge`, `FeatureIcon` (eigenes Line-Art-Icon-Set, `PATHS`-Record in `FeatureIcon.tsx` - neue Icons dort im selben Stil ergänzen)
- `RSVPButtonGroup` (auch für Terminfindung-Abstimmung wiederverwendet)
- `DashboardTemplate`, Header-Daten über `src/content/pageHeaders.ts`

**Pill-/Chip-Reihen (Filter, Kategorien, Tabs):** Horizontales Scrollen mit sichtbarer Scrollbar ist ein bekannter Antipattern hier - wurde mehrfach gefunden und auf `flex-wrap: wrap` umgestellt (Kalender-Filter, Feed-Kategorien, Admin-Tabs). Neue Pill-Reihen gleich mit `flex-wrap` bauen, nicht mit `overflow-x: auto`. Echte Karussells mit breiten Karten (Dashboard-Haushaltsstatus) dürfen weiter scrollen, aber ohne sichtbare Scrollbar (`scrollbar-width: none` + `::-webkit-scrollbar{display:none}`).

**Schriftgrößen:** `<button>` erbt in HTML keine `font-size` vom Elternelement. Globale Regel `button { font-size: inherit }` in `app-layout.css` fängt das für alle Buttons ohne eigene Größenangabe ab - bei neuen Button-Klassen trotzdem lieber explizit `font-size` setzen (Konvention: Chips/Tabs `var(--md-font-size-sm)`, normale Buttons über das `Button`-Atom das schon `md` setzt).

CSS-Dateien (`src/design-system/`, importiert über `global.css` in dieser Reihenfolge - später importierte Regeln gewinnen bei gleicher Spezifität):

`theme-light.css`, `theme-dark.css`, `error-boundary.css`, `app-layout.css`, `app-hero.css`, `manager.css`, `admin.css`, `admin-invites.css`, `admin-users.css`, `admin-content.css`, `admin-digest.css`, `auth.css`, `calendar.css`, `events.css`, `feed.css`, `help-board.css`, `dashboard.css`, `onboarding.css`, `neighbors.css`, `profile-settings.css`

## Aktueller Funktionsstand

Funktioniert und ist live verifiziert:

- Login/Logout, "Angemeldet bleiben" (7 Tage Session)
- Passwort vergessen (E-Mail-Reset-Link)
- Registrierung per personalisiertem Einladungscode (Admin- oder Nachbar-generiert)
- **Selbstbedienter Einladungslink** (`/beitreten/:token`): ein Link pro Straße, wiederverwendbar, Admin kann ihn im Adminbereich unter "Einladungen" einsehen/kopieren/erneuern. Wer den Link öffnet, legt entweder eine neue Familie an oder tritt einer bestehenden bei (Auswahl aus echter Haushaltsliste). Serverseitiger Duplikat-Schutz: Name **oder** Adresse schon vorhanden → Anlegen wird blockiert, "beitreten" vorgeschlagen (`Household::findByNormalizedNameOrAddress`).
- Adminbereich: Übersicht, Haushalte, Einladungen (Codes + Link), Nutzer, Inhalte, Feedback, Kalender, System
- Haushalte anlegen/löschen (Löschen entfernt Nicht-Admin-Mitglieder vollständig inkl. aller Referenzen, Admins werden nur vom Haushalt gelöst, nie gelöscht)
- Push: echte Ende-zu-Ende-verschlüsselte Payloads (RFC 8291 aes128gcm), nicht nur generischer "schau rein"-Text
- Dashboard, Onboarding mit Zwischenspeichern, Profil/Selbstverwaltung (Name, Passwort, Konto löschen, Datenexport)
- Nachbarschaftsverzeichnis, Straßen-Feed mit Reaktionen/Kommentaren/Hilfe-Zusagen/Ausleih-Status
- Hilfe/Schwarzes Brett
- Events: RSVP, Bearbeiten/Löschen, manuelle Push-Erinnerung an Haushalte ohne Rückmeldung
- **Terminfindung** (Doodle-artig, `/terminfindung/:id`): 2-5 Terminvorschläge statt fixem Termin, Nachbarn stimmen mit Kann/Vielleicht/Geht-nicht ab, Organisator/Admin legt Gewinner-Termin fest → wird zu echtem Event (`Event::create`), ab da normale RSVP. Bearbeitbar solange offen (Terminänderung setzt bestehende Stimmen zurück - bewusst vereinfacht, kein Diff). Löschbar unabhängig vom Status.
- Kalender ↔ Events verknüpft: jedes Event taucht automatisch im Kalender auf (`CalendarController::toCalendarEvent`), Klick führt zur Event-Detailseite
- **Feedback-/Bug-Kanal** (`/feedback`): Nutzer melden Bug/Idee/Sonstiges + Freitext, landet im Adminbereich (Tab "Feedback", offen/erledigt umschaltbar), Push an alle Admins bei neuer Meldung
- Mülltermin-Erinnerung am Vorabend (Push + E-Mail), Cron-Endpoints vorhanden (`/cron/trash-reminder`, `/cron/weekly-digest`), Cron-Token aus lokaler `api/cron-token.local.php` (gitignored)
- Wöchentlicher Digest als Admin-Vorschau/Test, Cron vorbereitet
- Admin-Systemstatus, PWA installierbar, Dark Mode

## Zuletzt bearbeiteter Bereich

Diese Session (09.08.2026), chronologisch:

1. Layout-Politur: Hero-Header/Content-Übergang (Content-Sheet überlappt Hero-Foto statt lose zu folgen, `app-hero.css` + `dashboard.css` identisch angepasst), Textgrößen-Hierarchie (Karten-Titel waren größer als Abschnitts-Überschriften), Hero-Leerraum verkleinert, Pillen-Umbruch statt Scroll (siehe UI-Bausteine oben), vertikale Zentrierung in Übersichts-Pillen (`align-items: baseline` → `center`).
2. Feedback-/Bug-Kanal gebaut (siehe Funktionsstand).
3. Event-Push-Erinnerung gebaut.
4. Selbstbedienter Einladungslink gebaut (siehe Funktionsstand) - dabei Alfahosting-Cron eingerichtet (2 Tasks im CloudPit-Panel: `/cron/weekly-digest` wöchentlich, `/cron/trash-reminder` täglich).
5. Terminfindung gebaut, dann Bearbeiten nachgezogen.
6. Kleines Refactoring: `User::toPublic()` extrahiert (war 1:1 in `AuthController` und `StreetJoinController` dupliziert), `HANDOFF_CLAUDE_CODE.md` aktualisiert.

Alles davon ist committed, gepusht und deployed, live verifiziert, Testdaten aufgeräumt.

## Aktueller Worktree-Hinweis

Worktree ist sauber (`git status` zeigt "up to date with origin/master"). Einzige lokale Abweichung: `.claude/launch.json` hat einen zusätzlichen Dev-Server-Eintrag für ein **anderes, unabhängiges Projekt** ("familieninsel-frontend") - gehört nicht in die Flurfunk-Historie, bewusst nicht committen.

## Sensible Stellen

### Hintergrundbilder und Header

Mehrfach problematisch gewesen, mittlerweile stabil, aber vorsichtig bleiben:

- Dashboard-Darstellung als Referenz für die eigene parallele Struktur.
- Header auf allen App-Seiten einheitlich (Content-Sheet-Pattern, siehe oben).
- Kein doppeltes Hintergrundbild, kein abgeschnittener Rand links.
- Login-Hintergrund vollflächig, mobile nicht kaputt machen.

Vor CSS-Änderungen hier lesen: `DashboardTemplate`, `app-layout.css`, `app-hero.css`, `dashboard.css`, `auth.css`.

### Mobile Navigation

Bottom Navigation ist sticky bottom, feste Icon-Reihe (`src/navigation/appNavigation.ts`, `mobilePrimary`-Flag). Neue Nav-Punkte (z. B. Feedback) bewusst **nicht** `mobilePrimary` setzen, damit die bestehenden Bottom-Nav-Icons unangetastet bleiben - tauchen dann in der Desktop-Sidebar und mobil im "Mehr"-Menü auf.

### Admin/Nutzer löschen

Self-Delete-Schutz ist wichtig: Admin darf sich nicht selbst löschen/demoten (letzter Admin geschützt), Server erzwingt das zusätzlich zum Frontend. Beim Löschen von Haushalten/Nutzern keine verwaisten Datensätze erzeugen - siehe `Household::delete()`/`User::delete()` als Referenz für vollständiges Aufräumen inkl. FK-Ketten.

### Sichtbarkeit / Privacy

Sichtbarkeits-Level (Öffentlich / Nur Nachbarn / Privat) sind fachlich wichtig, betreffen Status, Urlaub, Kinder, Events, Nachbarschaftsverzeichnis. Neue Features mit Sichtbarkeit (z. B. Terminfindung, Events) folgen demselben `public`/`neighbors`-Muster wie `EventController::isVisible()`.

### Registrierung / Auth

Zwei unabhängige Registrierungswege existieren nebeneinander (siehe Architekturüberblick): `AuthController::register()` (Code-basiert) und `StreetJoinController::register()` (Link-basiert, create-oder-join). Bewusst getrennt gehalten, damit Änderungen am einen Weg den anderen nicht gefährden. Beim Anfassen von Auth-Code: sparsam und additiv bleiben.

## Bekannte offene Punkte / Roadmap

Noch nicht gebaut, mehrfach angesprochen:

1. **Rate-Limiting/Brute-Force-Schutz auf Login** - aktuell keiner vorhanden.
2. **Wiederkehrende Events mit RSVP** (Kalender hat schon Serien/Wiederholung, Events noch nicht).
3. **Foto-Uploads** in Feed und Events.
4. **PWA "Zum Home-Bildschirm"-Hinweis in-App** - aktuell nur mündlich/in Einladungstexten kommuniziert (wichtig für iOS-Push, die App muss installiert sein, sonst kommen keine Pushes an).
5. Rolle "Straßensprecher" (Moderation ohne vollen Adminzugriff) - nicht priorisiert.
6. Reale Mülltermin-Daten sind noch nicht eingepflegt (Dateneingabe-Aufgabe für den Nutzer, kein Code).

## Nützliche Check-Kommandos

Ohne Build:

```bash
npx tsc -b --noEmit
git diff --check
```

Wenn PHP geändert wurde (jede geänderte/neue Datei einzeln):

```bash
php -l api/controllers/<Datei>.php
php -l api/index.php
```

Dateigrößen:

```bash
wc -l api/controllers/*.php src/pages/*.tsx | sort -rn | head -10
```

Nur nach expliziter Freigabe:

```bash
npm run deploy
```

## Kommunikation mit dem Nutzer

Der Nutzer möchte effizientere, größere Arbeitspakete, wenig Rückfragen, knappen Bericht danach: was geändert wurde, welche Checks liefen, was live verifiziert ist, was der nächste sinnvolle Schritt ist. Sprache: Deutsch, direkt, pragmatisch. Der Nutzer treibt das Produkt aktiv voran (nicht nur reaktiv Bugs melden) - eigene, gut begründete Vorschläge sind erwünscht.
