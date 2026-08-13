# Claude-Code-Handoff: Flurfunk / Nachbarschafts-App

Stand: 11.08.2026

Dieses Dokument ist der Kontext-Transfer für die Weiterarbeit mit Claude Code. Bitte zuerst komplett lesen, bevor Änderungen gemacht werden.

## Projektziel

Flurfunk ist eine mobile-first PWA für eine einzelne Straße/Nachbarschaft. Kein großes Social Network, sondern ein kleines, verständliches Werkzeug für echte Nachbarn:

- Einladung per Code (personalisiert) oder per Straßen-Link (selbstbedient)
- Haushalt/Profil/Onboarding
- Wer ist zuhause, Urlaub, Kinder-Status
- Straßen-Feed, Hilfe, Hinweise
- Events mit RSVP, Terminfindung (Doodle-artig), Wiederholung, Push-Erinnerung
- Kalender mit Kategorien, Farben und Serien
- Push-Benachrichtigungen (echte verschlüsselte Payloads, nicht nur "schau rein")
- Private 1:1-Nachrichten zwischen Nachbarn (haushaltsweise)
- Feedback-/Bug-Kanal von Nutzern an Admins
- Adminbereich für Rollout, Nutzer, Inhalte, Push-Tests, Systemstatus und Straßenkarte

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

**Browser-Pane-Tooleigenheit:** Wenn die Browser-Vorschau beim Nutzer nicht sichtbar/im Fokus ist, kompositiert sie keine Frames - dann schlagen `computer`-Klicks auf Koordinaten/Refs fehl oder landen daneben, ohne Fehler zu werfen (React-State ändert sich einfach nicht). Workaround: Element gezielt per `javascript_tool` mit `element.click()` klicken. Bei React-kontrollierten Inputs reicht `el.value = x` + `input`-Event nicht (React trackt den nativen Value-Setter) - stattdessen den nativen Setter explizit aufrufen:
```js
const proto = Object.getPrototypeOf(el);
Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, wert);
el.dispatchEvent(new Event('input', { bubbles: true }));
```

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
- `api/core/`: `Database.php` (SQLite + Migrationsrunner), `Auth.php`, `PushService.php`/`WebPush.php` (Push-Versand/-Verschlüsselung), `MailService.php`, `WeeklyDigest*`, `TrashReminderService.php`, `ImageUpload.php` (geteilte GD-Resize-Logik für Feed-/Event-Fotos, Seitenverhältnis erhalten - **nicht** dasselbe wie der quadratische Zuschnitt fürs Profilbild in `AuthController::uploadAvatarPhoto()`, die beiden bewusst getrennt), `RecurrenceExpander.php` (geteilte Wiederholungs-Logik für `calendar_entries` **und** `events` - beide nutzen identische Spaltennamen `starts_at`/`ends_at`/`recurrence_rule`/`recurrence_until`), `LoginAttempt.php`-Zugriff über `Models\LoginAttempt` (Brute-Force-Zähler pro E-Mail/IP)
- `api/migrations/`: fortlaufend nummeriert, aktuell bis `041_feed_items_poll_marketplace_types.sql`. Wenn ein CHECK-Constraint erweitert werden muss (SQLite kann das nicht per ALTER TABLE): Tabelle neu aufbauen wie in `007_household_invites.sql`/`032_calendar_childcare_type.sql`/`041_feed_items_poll_marketplace_types.sql` (`PRAGMA foreign_keys = OFF`, neue Tabelle mit `_new`-Suffix, Daten kopieren, alte droppen, umbenennen, `PRAGMA foreign_keys = ON`). **Falle, in die wir schon reingelaufen sind:** `feed_items.type` hat einen CHECK-Constraint aus einer alten PRD-Fassung, der nicht mit `FeedItem::MVP_TYPES` übereinstimmt - vor jedem neuen Feed-Post-Typ prüfen, ob er im CHECK-Constraint der Tabelle steht (`grep "CHECK (type IN" api/migrations/*.sql`), sonst gibt's einen 500er erst beim tatsächlichen INSERT, nicht schon vorher.
- **Nachrichten (Messenger)**: `Conversation.php`/`Message.php`/`MessageController.php`. Bewusste Design-Entscheidung: Unterhaltungen laufen auf **Haushalts-Ebene** (wie Feed/Events), nicht auf Nutzer-Ebene - ein Haushalt mit mehreren Mitgliedern teilt sich eine Unterhaltung mit dem Nachbar-Haushalt, einzelne Nachrichten merken sich aber `sender_user_id`/`sender_household_id` für die Bubble-Zuordnung im Frontend. Kein Websocket (Shared Hosting) - Frontend pollt (Liste alle 20s über `MessagesContext`, offener Chat alle 5s).

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

`theme-light.css`, `theme-dark.css`, `error-boundary.css`, `app-layout.css`, `app-hero.css`, `manager.css`, `admin.css`, `admin-invites.css`, `admin-users.css`, `admin-content.css`, `admin-digest.css`, `admin-street-map.css`, `auth.css`, `calendar.css`, `events.css`, `feed.css`, `help-board.css`, `dashboard.css`, `onboarding.css`, `neighbors.css`, `messages.css`, `profile-settings.css`

## Aktueller Funktionsstand

Funktioniert und ist live verifiziert:

- Login/Logout, "Angemeldet bleiben" (7 Tage Session)
- Passwort vergessen (E-Mail-Reset-Link)
- Registrierung per personalisiertem Einladungscode (Admin- oder Nachbar-generiert)
- **Selbstbedienter Einladungslink** (`/beitreten/:token`): ein Link pro Straße, wiederverwendbar, Admin kann ihn im Adminbereich unter "Einladungen" einsehen/kopieren (roher Link oder fertiger erklärender Einladungstext)/erneuern. Wer den Link öffnet, muss sich zuerst bewusst zwischen "Wir sind neu" und "Familie ist schon dabei" entscheiden (keine Vorauswahl, kein Formular sichtbar vor der Wahl, Warnhinweis prominent) und legt dann entweder eine neue Familie an oder tritt einer bestehenden bei (Auswahl aus echter Haushaltsliste). Serverseitiger Duplikat-Schutz: Name **oder** Adresse schon vorhanden → Anlegen wird blockiert, "beitreten" vorgeschlagen (`Household::findByNormalizedNameOrAddress`).
- Adminbereich: Übersicht, Haushalte, Einladungen (Codes + Link, inkl. endgültigem Löschen bereits genutzter/widerrufener Codes), Nutzer, Inhalte, Feedback, Kalender, Karte, System
- Haushalte anlegen/löschen (Löschen entfernt Nicht-Admin-Mitglieder vollständig inkl. aller Referenzen, Admins werden nur vom Haushalt gelöst, nie gelöscht)
- Push: echte Ende-zu-Ende-verschlüsselte Payloads (RFC 8291 aes128gcm), nicht nur generischer "schau rein"-Text. Übersicht "wann wird welche Push wann an wen geschickt" permanent im Admin-Tab System (`AdminSystemStatusPanel`)
- Login-Rate-Limiting: 5 Fehlversuche/E-Mail bzw. 20/IP innerhalb 15 Minuten → 15 Minuten Sperre (429), `LoginAttempt`-Model
- Dashboard, Onboarding mit Zwischenspeichern, Profil/Selbstverwaltung (Name, Passwort, **Profilbild-Upload** mit serverseitigem quadratischem Zuschnitt, Konto löschen, Datenexport)
- Nachbarschaftsverzeichnis, Straßen-Feed mit Reaktionen/Kommentaren/Hilfe-Zusagen/Ausleih-Status/**Foto pro Post**
- Hilfe/Schwarzes Brett
- **Nachrichten** (`/nachrichten`, `/nachrichten/:id`): private 1:1-Unterhaltungen zwischen zwei **Personen** (`conversations.user_a_id`/`user_b_id`, nicht Haushalte), Einstieg über "Nachricht an [Name]" auf der Nachbarn-Seite/Straßenkarte (pro Haushaltsmitglied, auch für Mitglieder des eigenen Haushalts), Push bei neuer Nachricht, Ungelesen-Badge in Sidebar/Bottom-Nav
- **Straßenkarte** (Admin-Tab "Karte"): schematische Anordnung der Haushalte nach Hausnummer (ungerade/gerade links/rechts einer Straßenlinie), bewusst erstmal nur für Admins sichtbar, bis sich das Konzept bewährt hat - noch nicht für alle Nachbarn freigegeben
- Events: RSVP, Bearbeiten/Löschen, manuelle Push-Erinnerung an Haushalte ohne Rückmeldung, **Foto pro Event**, **Wiederholung** (täglich/wöchentlich/monatlich, gleiche `RecurrenceExpander`-Logik wie Kalender). RSVP bleibt bei wiederkehrenden Events bewusst serienweit (ein Set pro Event-Datensatz, nicht pro Einzeltermin)
- **Terminfindung** (Doodle-artig, `/terminfindung/:id`): 2-5 Terminvorschläge statt fixem Termin, Nachbarn stimmen mit Kann/Vielleicht/Geht-nicht ab, Organisator/Admin legt Gewinner-Termin fest → wird zu echtem Event (`Event::create`), ab da normale RSVP. Bearbeitbar solange offen (Terminänderung setzt bestehende Stimmen zurück - bewusst vereinfacht, kein Diff). Löschbar unabhängig vom Status.
- Kalender ↔ Events verknüpft: jedes Event (inkl. wiederkehrender, mit Occurrence-Expansion) taucht automatisch im Kalender auf (`CalendarController::toCalendarEvent`), Klick führt zur Event-Detailseite
- **Feedback-/Bug-Kanal** (`/feedback`): Nutzer melden Bug/Idee/Sonstiges + Freitext, landet im Adminbereich (Tab "Feedback", offen/erledigt umschaltbar), Push an alle Admins bei neuer Meldung
- Mülltermin-Erinnerung am Vorabend (Push + E-Mail), Cron-Endpoints vorhanden (`/cron/trash-reminder`, `/cron/weekly-digest`), Cron-Token aus lokaler `api/cron-token.local.php` (gitignored)
- Wöchentlicher Digest als Admin-Vorschau/Test, Cron vorbereitet
- Admin-Systemstatus, PWA installierbar, Dark Mode
- **PWA-Installationshinweis** auf dem Dashboard: iOS bekommt eine Teilen-Anleitung (kein natives `beforeinstallprompt` dort), Android/Chrome einen echten Installieren-Button; dismissible, `AddToHomeScreenHint`
- Kalender-Kategorien inkl. "Kinderbetreuung" (z. B. "Kinder bei Papa" - bewusst **kein** Status, siehe Sensible Stellen)
- **Straßen-Umfragen**: neuer Feed-Post-Typ `poll` (`feed_poll_options`/`feed_poll_votes`), 2-5 Antworten, eine Stimme pro Person (`UNIQUE(feed_item_id, user_id)`, erneutes Abstimmen ersetzt die alte Stimme), läuft im normalen Straße-Feed unter der Kategorie "Umfragen" mit - kein eigener Nav-Punkt/keine eigene Seite
- **Kleinanzeigen-Markt** (`/markt`, eigener Nav-Punkt "Markt"): zwei neue Feed-Post-Typen `marketplace_sell`/`marketplace_give`, reines Reuse bestehender Feed-Infrastruktur - kein neues Schema. "Reservieren" nutzt denselben `feed_loans`-Mechanismus wie "Werkzeug ausleihen" (nur Wortlaut in `FeedItemCard` unterscheidet sich), "Als verkauft/verschenkt markieren" nutzt den bestehenden `status`-Toggle
- **Geburtstage**: `users.birthday_month`/`birthday_day` (nur Monat/Tag, bewusst kein Jahr - kein Alter preisgeben), self-service in den Profil-Einstellungen. Dashboard zeigt ein Banner "Heute Geburtstag: ..." - kombiniert `User::todaysBirthdays()` mit `Child::todaysBirthdays()` (nutzt das schon vorhandene `children.birthdate`-Feld, respektiert die `children`-Sichtbarkeitseinstellung des Haushalts)

## Zuletzt bearbeiteter Bereich

09.08.2026, chronologisch:

1. Layout-Politur: Hero-Header/Content-Übergang (Content-Sheet überlappt Hero-Foto statt lose zu folgen, `app-hero.css` + `dashboard.css` identisch angepasst), Textgrößen-Hierarchie (Karten-Titel waren größer als Abschnitts-Überschriften), Hero-Leerraum verkleinert, Pillen-Umbruch statt Scroll (siehe UI-Bausteine oben), vertikale Zentrierung in Übersichts-Pillen (`align-items: baseline` → `center`).
2. Feedback-/Bug-Kanal gebaut (siehe Funktionsstand).
3. Event-Push-Erinnerung gebaut.
4. Selbstbedienter Einladungslink gebaut (siehe Funktionsstand) - dabei Alfahosting-Cron eingerichtet (2 Tasks im CloudPit-Panel: `/cron/weekly-digest` wöchentlich, `/cron/trash-reminder` täglich).
5. Terminfindung gebaut, dann Bearbeiten nachgezogen.
6. Kleines Refactoring: `User::toPublic()` extrahiert (war 1:1 in `AuthController` und `StreetJoinController` dupliziert), `HANDOFF_CLAUDE_CODE.md` aktualisiert.

10.08.2026 - erster echter Testlauf mit Kathrin (Testerin), zwei konkrete Findings behoben:

7. Einladungslink führte zu Verwirrung ("beide aus einer Familie legen gleichzeitig eine neue Familie an") - `JoinStreetPage` erzwingt jetzt eine bewusste Erstwahl mit Warnhinweis (siehe Funktionsstand), Admin-Panel bekam einen "Einladungstext kopieren"-Button statt nur den nackten Link.
8. Status "Kinder bei Mama/Papa" passte konzeptionell nicht (kein Datum) - aus `DEFAULT_STATUSES` entfernt, dafür neue Kalender-Kategorie "Kinderbetreuung" (Migration 032, Tabellen-Rebuild für den CHECK-Constraint).
9. System-Check auf Zuruf: Haushalte/Nutzer/Feed/Events/Kalender/Feedback/Terminfindungen waren schon sauber (nur Manuel + Kathrin, keine Testreste) - die disziplinierte Aufräum-Routine aus Schritt 8 im Workflow zahlt sich aus.

11.08.2026, chronologisch (großer Arbeitstag, viele einzelne Freigaben nacheinander):

10. Profilbild-Upload für alle Nutzer (Migration 033, `AuthController::uploadAvatarPhoto()`/`deleteAvatarPhoto()`, quadratischer GD-Zuschnitt auf 320px, `api/uploads/avatars/`).
11. Push-Benachrichtigungs-Übersicht permanent im Admin-Tab System ergänzt (statt nur einmalig im Chat zu beantworten) - reine Referenztabelle, keine neuen Daten/Tracking.
12. Zwei Aufräum-Fixes: inaktiven Test-Hinweis gelöscht; für bereits genutzte/widerrufene Einladungen gab es keinen Lösch-Weg (nur Widerrufen, das nur bei offenen Einladungen greift) - neuer "endgültig löschen"-Endpunkt (`DELETE /admin/invites/{id}/purge`) ergänzt.
13. Straßenkarte im Admin-Tab "Karte" gebaut (siehe Funktionsstand) - auf Wunsch bewusst erstmal nur für Admins, bis sich das Konzept bewährt hat.
14. **Nachrichten-Messenger** komplett neu gebaut (Migration 034, `Conversation`/`Message`/`MessageController`, Frontend `/nachrichten` + `/nachrichten/:id`, `MessagesContext` für Ungelesen-Badge-Polling). Beim Live-Test mit zwei Accounts zwei echte Bugs gefunden und gefixt: Detailansicht zeigte die letzte Nachricht nicht (fehlender Join in `Conversation::findById`), Ungelesen-Zähler lieferte immer 0 (doppelt gequotetes `"1970-01-01"` in Raw-SQL wurde von SQLite als Spaltenname statt String interpretiert - jetzt gebundener Parameter).
15. Login-Rate-Limiting gebaut (Migration 035, `LoginAttempt`-Model, siehe Funktionsstand). Nebenbei Bug gefixt: `LoginPage` zeigte immer nur eine generische Fehlermeldung statt der echten Backend-Antwort.
16. Mobile-Scan über Admin (alle Tabs inkl. der neuen Karte/System-Erweiterung), Nachrichten, Profilbild, Nachbarn-Einstiegspunkt - ein echter Bug gefunden und gefixt: Chat-Sendefeld lag auf dem Handy unter der fixierten Bottom-Navigation versteckt (`.chat-content` reservierte keinen Platz dafür).
17. Drei weitere Roadmap-Punkte umgesetzt: PWA-Installationshinweis (`AddToHomeScreenHint`), Foto-Uploads in Feed/Events (Migration 036, `ImageUpload`-Core-Klasse, `PhotoPickerField`), wiederkehrende Events mit RSVP (Migration 037, `RecurrenceExpander`-Core-Klasse aus der bisherigen Kalender-Logik extrahiert und für Events wiederverwendet statt dupliziert - RSVP bleibt bewusst serienweit, nicht pro Einzeltermin).

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

### Status vs. Kalender

`Household.statusLabel` (Dashboard/Nachbarn "wer ist zuhause") ist bewusst nur für einzelne Jetzt-Werte ohne Datum gedacht (`DEFAULT_STATUSES` in `types/household.ts`). Alles mit einem Zeitraum oder Datum (z. B. Kinderbetreuung, Besuch, Abwesenheit über mehrere Tage) gehört in den Kalender (`calendar_entries`), nicht als neue Status-Option - hier nicht wieder vermischen.

### Nachrichten (Messenger)

Läuft auf **Nutzer-Ebene** (`conversations.user_a_id`/`user_b_id`, `UNIQUE`+`CHECK (user_a_id < user_b_id)`), nicht Haushalts-Ebene. War ursprünglich haushaltsweise gebaut, wie der Rest der App - das war ein echter Bug: Mitglieder desselben Haushalts konnten sich strukturell nicht gegenseitig schreiben (z. B. Manuel → Kathrin, gleicher Haushalt). Am 12.08.2026 auf Personen-Ebene umgebaut (Migration `038_conversations_user_level.sql`, Tabellen `conversations`/`messages` neu aufgesetzt statt migriert - zum Zeitpunkt gab es produktiv nur einen einzigen Haushalt, also keine echten Unterhaltungsdaten, die verloren gehen konnten). `NeighborCard`/`StreetMapBoard` bieten jetzt pro Haushaltsmitglied (außer sich selbst) einen eigenen "Nachricht an [Name]"-Button an, auch für Mitglieder des eigenen Haushalts.

### Registrierung / Auth

Zwei unabhängige Registrierungswege existieren nebeneinander (siehe Architekturüberblick): `AuthController::register()` (Code-basiert) und `StreetJoinController::register()` (Link-basiert, create-oder-join). Bewusst getrennt gehalten, damit Änderungen am einen Weg den anderen nicht gefährden. Beim Anfassen von Auth-Code: sparsam und additiv bleiben.

## Bekannte offene Punkte / Roadmap

Noch nicht gebaut bzw. noch offen:

1. **Straßenkarte für alle Nachbarn freigeben** - aktuell bewusst nur im Admin-Tab "Karte" sichtbar (siehe Funktionsstand), auf Zuruf des Nutzers erstmal so gelassen. Rückfrage beim Nutzer, ob/wann sie für alle Nachbarn geöffnet werden soll.
2. Rolle "Straßensprecher" (Moderation ohne vollen Adminzugriff) - nicht priorisiert.
3. Reale Mülltermin-Daten sind noch nicht eingepflegt (Dateneingabe-Aufgabe für den Nutzer, kein Code).

Erledigt seit der letzten Roadmap-Fassung: Rate-Limiting/Brute-Force-Schutz, wiederkehrende Events mit RSVP, Foto-Uploads in Feed/Events, PWA-Installationshinweis (siehe Funktionsstand und "Zuletzt bearbeiteter Bereich").

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
