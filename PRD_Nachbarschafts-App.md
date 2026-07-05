
# PRD: Nachbarschafts-PWA "Straßenplaner"

**Stack:** React + Vite + TypeScript (Atomic Design) · PHP 8.x nativ + SQLite (Mini-MVC) · PWA
**Deployment:** `www.red-it.org/apps/neighborhood` (FTP/FTPS via `npm run deploy`, Shared Hosting)
**Leitprinzipien:** so wenig Dependencies wie möglich (Backend: praktisch keine), Dateien < 500 Zeilen, Mobile First.

---

## 0. Executive Summary

Eine Progressive Web App für eine einzelne Straße/Nachbarschaft, die Haushalte (nicht Einzelpersonen) als zentrale Einheit organisiert. Statt Social-Media-Rauschen liefert sie einen klaren, freundlichen Überblick: Wer ist zuhause, wer im Urlaub, wo sind die Kinder, was ist heute los in der Straße. Ziel ist echter Alltagsnutzen – Pakete, Werkzeug, Mülltonnen, spontane Treffen, Nachbarschaftshilfe – ohne Like-Buttons, Kommentar-Kriege oder Datensammelwut.

---

## 1. Produktvision & Zielgruppe

**Vision:** "WhatsApp-Gruppe der Straße" ersetzen durch ein strukturiertes, übersichtliches Tool, das Status, Termine und Hilfe auf einen Blick zeigt – ohne dass wichtige Infos in einem Chat-Verlauf untergehen.

**Zielgruppe:** Bewohner einer einzelnen Straße/Siedlung/Nachbarschaft (ca. 5–40 Haushalte), Erwachsene jeden Alters, Familien mit Kindern, ältere Nachbarn, die einfache Bedienung brauchen.

**Nicht-Ziele:** kein öffentliches Social Network, kein Feed-Algorithmus, keine Werbung, keine Likes/Kommentare-Kaskaden, kein Ersatz für Notruf/Polizei bei echten Notfällen.

**Nutzenversprechen:**

- Auf einen Blick sehen, wer zuhause/im Urlaub ist, ohne nachfragen zu müssen.
- Events planen, ohne 15 WhatsApp-Nachrichten hin und her.
- Kinder sind über Haushalte hinweg "sichtbar betreut" (bei Mama/Papa/Oma/Freunden), was Absprachen zwischen Nachbarn erleichtert.
- Kleine Alltagshilfen (Paket, Werkzeug, Babysitter, Hilfe) zentral statt verstreut im Chat.
- Jeder Haushalt bestimmt selbst, was er von sich preisgibt.

---

## 2. Featureliste (vollständig, gruppiert)

**Haushalt & Familie**
Haushaltsprofil (Adresse, Name, 1–2 Erwachsene mit eigenem Login, beliebig viele Kinder, Haustiere) · Kinderverwaltung mit Aufenthaltsort · Sichtbarkeits-Einstellungen pro Haushalt/Feld.

**Status & Feed**
Haushaltsstatus (Zuhause/Urlaub/Unterwegs/Gäste/Grillabend/Nicht stören …) · Straßen-Feed mit 17 Post-Typen (Urlaub, Besuch erwartet, Paket angenommen, Werkzeug verleihbar, Hilfe benötigt, Babysitter gesucht, Hund entlaufen, Katze gefunden, Straße gesperrt, Gartenparty, Grillabend, spontanes Treffen, Mülltonnen-Erinnerung, Straßenevent u.a.).

**Planung**
Event-Erstellung (Grillabend, Lagerfeuer, Straßenfest, Fußball, Poolparty, Glühwein, Weihnachtsfeier, frei definierbar) · RSVP pro Haushalt (Zusage/Vielleicht/Absage) mit Detailgrad ("2 Erwachsene, 2 Kinder – kommt mit allen" oder "nur Thomas kommt").

**Kalender**
Gemeinsamer Straßenkalender: Urlaube, Events, Besuche, Straßenaktionen, Ferien, Mülltermine, Geburtstage (optional), wichtige Termine. Monats- und Listenansicht.

**Kommunikation**
Push-Benachrichtigungen (Einladung, Terminänderung, Grillabend heute, Urlaub begonnen, Paket angekommen, Werkzeug zurückbringen, Vermisstmeldung).

**Verwaltung & Sicherheit**
Rollen (Admin/Haushalt/Nachbar/Gast) · Einladungscode-basierte Registrierung · Admin-Bereich (Nutzer-/Haushaltsverwaltung, Moderation).

**Dashboard**
Zentrale Startseite: wer zuhause, wer im Urlaub, welche Kinder spielen heute, anstehende Events, wer braucht Hilfe, Geburtstage heute, online-Status der Haushalte.

**PWA**
Installierbar (Add to Homescreen), Offline-Fallback, Dark/Light Mode, große Touch-Ziele.

---

## 3. MVP-Abgrenzung (v1.0)

**Enthalten:** Registrierung per Einladungscode, Login, Haushaltsprofil (Adresse, Name, 1–2 Erwachsene, Kinder, Haustiere), Haushaltsstatus (8 Standard-Status), Dashboard-Grundansicht, Straßen-Feed mit den 8 wichtigsten Post-Typen (Urlaub, Zuhause, Besuch erwartet, Paket angenommen, Werkzeug verleihbar, Hilfe benötigt, Straße gesperrt, Babysitter gesucht), einfacher Kalender (Urlaube + manuelle Termine), Sichtbarkeits-Einstellungen (öffentlich/nur Nachbarn/privat) pro Haushalt, Basis-Push (neue Einladung, neuer Feed-Post), PWA-Grundgerüst (Manifest, Icon, Installierbarkeit, Light/Dark).

**Explizit nicht in v1.0:** Event-Planung mit RSVP (→ v1.5), Kinder-Aufenthaltsort-Tracking im Detail (→ v1.5), Mülltonnen-Wiederholungslogik (→ v2.0), Werkzeugverleih als eigene Liste (→ v2.0), Vermisst-Meldungen Hund/Katze (→ v2.0), Admin-Bereich UI (→ v2.0, in v1.0 reicht direkter DB-Zugriff), Mehrere Straßen/Mandantenfähigkeit (→ v3.0).

Begründung: v1.0 muss beweisen, dass "Status + Feed + Kalender" bereits echten Alltagsnutzen bringt, bevor Planungs- und Spezialfunktionen den Scope aufblähen.

---

## 4. Datenbankmodell (SQLite, nativ, PDO)

Schema ist bereits mit `street_id` vorbereitet, damit v3.0 (mehrere Straßen) ohne Breaking Change möglich ist – in v1.0 gibt es genau eine Zeile in `streets`.

### streets
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| name | VARCHAR(120) | z.B. "Musterstraße" |
| invite_code | VARCHAR(32) UNIQUE | für Registrierung |
| created_at | DATETIME | |

### users
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK → households.id, NULL | NULL bis Haushalt zugeordnet |
| email | VARCHAR(190) UNIQUE | |
| password_hash | VARCHAR(255) | `password_hash()` |
| display_name | VARCHAR(80) | |
| role | ENUM('admin','member','guest') | Basisrolle, siehe Kapitel 5 |
| avatar_url | VARCHAR(255) NULL | |
| notification_prefs | JSON | pro Kategorie an/aus |
| last_login_at | DATETIME NULL | |
| created_at | DATETIME | |

### households
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| street_id | INT FK | |
| name | VARCHAR(80) | z.B. "Familie Schneider" |
| address_line | VARCHAR(160) | Straße + Hausnummer |
| status_emoji | VARCHAR(8) | aktueller Status |
| status_label | VARCHAR(60) | |
| status_note | VARCHAR(160) NULL | Freitext |
| status_updated_at | DATETIME NULL | |
| created_at | DATETIME | |

### children
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK | |
| name | VARCHAR(60) | |
| birthdate | DATE NULL | |
| current_location | ENUM('mama','papa','both','grandparents','friends','vacation','school','kindergarten','other') | |
| location_note | VARCHAR(120) NULL | |
| updated_at | DATETIME | |

### pets
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK | |
| name | VARCHAR(60) | |
| type | ENUM('dog','cat','other') | |

### feed_items
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK | |
| type | ENUM('vacation','home','visit_expected','garden_party','bbq','spontaneous_meetup','street_closed','package_received','tool_available','help_needed','babysitter_needed','dog_lost','cat_found','trash_reminder','street_event','other') | |
| message | VARCHAR(280) NULL | |
| visibility | ENUM('public','neighbors','private') | |
| expires_at | DATETIME NULL | z.B. Paket-Meldung verschwindet nach 3 Tagen |
| created_at | DATETIME | |

### events
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| creator_household_id | INT FK | |
| title | VARCHAR(120) | |
| type | ENUM('bbq','campfire','street_festival','kids_play','football','pool_party','mulled_wine','christmas_party','other') | |
| description | TEXT NULL | |
| location | VARCHAR(160) NULL | |
| starts_at | DATETIME | |
| ends_at | DATETIME NULL | |
| visibility | ENUM('public','neighbors') | |
| created_at | DATETIME | |

### event_responses
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| event_id | INT FK | |
| household_id | INT FK | |
| response | ENUM('yes','maybe','no') | |
| adults_count | TINYINT NULL | |
| children_count | TINYINT NULL | |
| note | VARCHAR(120) NULL | z.B. "nur Thomas kommt" |
| responded_by_user_id | INT FK | |
| updated_at | DATETIME | |

### calendar_entries
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| type | ENUM('vacation','birthday','event','visit','street_action','holiday','trash','appointment') | |
| source_table | VARCHAR(30) NULL | z.B. `events`, `households` |
| source_id | INT NULL | Referenz auf Ursprungsdatensatz |
| household_id | INT FK NULL | |
| title | VARCHAR(120) | |
| starts_at | DATETIME | |
| ends_at | DATETIME NULL | |
| all_day | TINYINT(1) | |
| visibility | ENUM('public','neighbors','private') | |

### tool_listings
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK | |
| name | VARCHAR(80) | |
| description | VARCHAR(200) NULL | |
| is_available | TINYINT(1) | |
| borrowed_by_household_id | INT FK NULL | |
| borrowed_until | DATE NULL | |

### trash_schedules
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| street_id | INT FK | |
| bin_type | ENUM('residual','recycling','paper','organic') | |
| recurrence_rule | VARCHAR(60) | einfache Regel, z.B. "every_2_weeks:tuesday" |
| next_date | DATE | |

### household_visibility_settings
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| household_id | INT FK | |
| field_key | VARCHAR(40) | z.B. `status`, `children_location`, `vacation` |
| visibility | ENUM('public','neighbors','private') | |

### notifications
| Feld | Typ | Hinweis |
|---|---|---|
| id | INT PK | |
| user_id | INT FK | |
| type | VARCHAR(40) | |
| payload | JSON | |
| read_at | DATETIME NULL | |
| created_at | DATETIME | |

**Beziehungen (Kurzform):** `streets 1—n households`, `households 1—n users` (max. 2 mit Rolle `member`), `households 1—n children/pets/feed_items/tool_listings`, `events 1—n event_responses`, `calendar_entries` referenziert lose (`source_table`/`source_id`) andere Tabellen statt harter FKs, damit ein Kalendereintrag optional frei (z.B. manueller Termin) sein kann.

---

## 5. Rollen- & Berechtigungsmodell

Es gibt eine **globale Basisrolle** je User (`admin`, `member`, `guest`) plus einen **kontextabhängigen Blick**: gegenüber dem eigenen Haushalt agiert man immer als "Haushalt" (voller Zugriff), gegenüber fremden Haushalten als "Nachbar" (nur sichtbare Felder gemäß deren Visibility-Einstellungen).

| Rolle | Eigener Haushalt | Fremde Haushalte | Verwaltung |
|---|---|---|---|
| **Admin** | voller Zugriff | sieht alles (Moderation/Support) | Nutzer, Einladungscodes, Moderation, Mülltermine pflegen |
| **Haushalt** (`member`) | lesen/schreiben (Status, Kinder, Feed, Events, Sichtbarkeit) | sieht nur, was als `public` oder `neighbors` markiert ist | eigene Sichtbarkeits-Einstellungen |
| **Nachbar** | – (ist kontextuelle Sicht von `member` auf andere Haushalte) | s.o. | – |
| **Gast** (`guest`) | kein eigener Haushalt | sieht nur `public`-Felder, read-only | – |

Praxis-Beispiel: Herr Schneider (`member`) sieht bei Familie Meier den Status "🏖 Urlaub", weil Meiers `status` auf `neighbors` gestellt haben, aber nicht deren Kinder-Aufenthaltsort, weil dieses Feld auf `private` steht.

Rechteprüfung passiert zentral im Backend (`core/Auth.php` + Visibility-Check pro Feld), nie nur im Frontend.

---

## 6. UI-Konzept & Design-System

**Stil:** Material Design 3, große abgerundete Karten (16–24px Radius), viel Weißraum, freundliche warme Primärfarbe (Terracotta/Orange, symbolisiert Nachbarschaftswärme) + Grün als Sekundärfarbe (Garten/Natur), neutrale Grautöne für Flächen. Light & Dark Mode über CSS-Custom-Properties (MD3-Tokens: `--md-sys-color-primary` usw.), kein UI-Framework nötig – Tokens + wenige generische Atome reichen.

**Kernkomponenten (Atomic Design):**

- **Atome:** Button, IconButton, Avatar, StatusEmoji, Badge/Chip, Input, Switch, Divider.
- **Molekülen:** StatusCard (Haushalt + Emoji + Label), RSVPButtonGroup (Zusage/Vielleicht/Absage), ChildLocationChip, NavItem, NotificationRow.
- **Organismen:** BottomNavigation, HouseholdStatusList (Dashboard), EventCard, CalendarMonthGrid, FeedList, HouseholdEditForm.
- **Templates:** DashboardTemplate, EventDetailTemplate, AuthTemplate, HouseholdProfileTemplate.
- **Pages:** binden Templates an echte Daten/Routen.

**Bedienprinzip:** maximal 2 Taps bis zur häufigsten Aktion (Status ändern = 1 Tap auf FAB + 1 Tap auf Emoji). Große Touch-Ziele (min. 48×48px) für ältere Nutzer.

---

## 7. Navigationsstruktur (Sitemap)

**Bottom Navigation (mobile, 5 Items):** Dashboard · Kalender · Events · Straße (Feed) · Mehr (Profil/Haushalt/Einstellungen/Admin).

```
/login
/registrieren/:inviteCode?
/dashboard                     → Startseite
/kalender                      → Monats-/Listenansicht
/events                        → Übersicht geplanter Events
/events/:id                    → Detail + RSVP-Liste
/strasse                       → Feed aller Post-Typen
/haushalt/mein                 → eigenes Profil verwalten (Adresse, Mitglieder, Kinder, Haustiere, Sichtbarkeit)
/haushalt/:id                  → öffentliches Profil eines Nachbar-Haushalts
/einstellungen                 → Account, Benachrichtigungen, Theme
/admin                         → nur Rolle admin (Nutzer, Einladungscodes, Moderation)
```

---

## 8. Wireframes (Schlüsselbildschirme)

**Dashboard (Textstruktur):**

```
┌ Header: "Guten Morgen, Familie Schneider" ─ 🔔 ┐
│ [Status-Karte: eigener Haushalt, Emoji groß]   │
│ Reihe: 🏠 Zuhause 5 · 🏖 Urlaub 2 · 🚗 unterwegs 1 │
│ "Heute in der Straße"                          │
│  → Event-Karte: Grillabend heute 18 Uhr (5 Zusagen) │
│  → Feed-Karte: Familie Meier – Paket angenommen│
│ "Kinder heute"                                 │
│  → Chips: Lena (bei Mama), Tom (Kindergarten)  │
│ "Braucht Hilfe"                                │
│  → Karte: Herr Bauer – Werkzeug gesucht        │
│ FAB (+) unten rechts → Status/Feed/Event anlegen│
└─────────────────────────────────────────────────┘
[Bottom Nav: Dashboard | Kalender | Events | Straße | Mehr]
```

Ein visuelles Mockup dieses Dashboards folgt direkt im Chat nach diesem Dokument.

**Event-Detail:** Titel/Bild-Header → Datum/Ort → Beschreibung → RSVP-Buttons (Zusage/Vielleicht/Absage) → Liste "Wer kommt": *Familie Schneider – 2 Erwachsene, 2 Kinder – kommt mit allen*, *Nur Thomas kommt*.

**Kinderverwaltung:** Liste der Kinder des Haushalts, pro Kind ein Dropdown/Chip-Auswahl (bei Mama/Papa/beide/Oma&Opa/Freunde/Urlaub/Schule/Kita) mit Zeitstempel "seit 14:00 Uhr".

**Haushalt-Status ändern (Bottom Sheet):** Grid aus 8 großen Emoji-Kacheln, ein Tap setzt Status + optionalen Freitext-Kommentar.

---

## 9. Technische Architektur

### 9.1 Tech-Stack (final)

Frontend: React 18 + TypeScript + Vite, React Router (einzige Routing-Dependency), `vite-plugin-pwa` für Manifest/Service Worker (erspart handgeschriebenen SW-Code). Kein UI-Kit, kein State-Management-Framework (Context + Hooks reichen für diese Domänengröße).

Backend: PHP 8.x, **keine Composer-Pakete**, PDO (in PHP core enthalten) für SQLite, native Sessions für Auth. Reines Mini-MVC ohne Framework. SQLite statt MySQL, da eine einzelne Straße (5–40 Haushalte) keinen separaten Datenbank-Server braucht – die Datei-Datenbank spart die Einrichtung beim Hoster und die Migrationen laufen automatisch beim ersten Request.

### 9.2 Frontend-Ordnerstruktur (Atomic Design, jede Datei < 500 Zeilen)

```
src/
  main.tsx
  App.tsx
  routes/AppRoutes.tsx
  design-system/
    tokens/colors.ts
    tokens/spacing.ts
    theme-light.css
    theme-dark.css
  components/
    atoms/Button.tsx, IconButton.tsx, Avatar.tsx, StatusEmoji.tsx, Chip.tsx, Input.tsx
    molecules/StatusCard.tsx, RSVPButtonGroup.tsx, ChildLocationChip.tsx, NavItem.tsx
    organisms/BottomNavigation.tsx, HouseholdStatusList.tsx, EventCard.tsx, CalendarMonthGrid.tsx, FeedList.tsx
    templates/DashboardTemplate.tsx, EventDetailTemplate.tsx, AuthTemplate.tsx
  pages/DashboardPage.tsx, CalendarPage.tsx, EventsPage.tsx, EventDetailPage.tsx, StreetFeedPage.tsx, HouseholdPage.tsx, LoginPage.tsx, RegisterPage.tsx, SettingsPage.tsx, AdminPage.tsx
  hooks/useAuth.ts, useHouseholds.ts, useEvents.ts, useCalendar.ts, useFeed.ts
  api/client.ts, authApi.ts, householdsApi.ts, eventsApi.ts, calendarApi.ts, feedApi.ts, childrenApi.ts
  context/AuthContext.tsx
  types/household.ts, event.ts, child.ts, user.ts, feedItem.ts
  utils/date.ts, visibility.ts
```

Faustregel: Wird eine Komponente/ein Hook zu groß, wird sie in kleinere Molekülen/Sub-Hooks zerlegt statt eine 500+-Zeilen-Datei zu akzeptieren.

### 9.3 Backend-Ordnerstruktur (Mini-MVC, `api/`)

```
api/
  index.php                  ← Front-Controller / Mini-Router
  config.php                 ← SQLite-Dateipfad, Session-Name (nicht in Git, .gitignore)
  config.example.php
  .htaccess                  ← alle Requests auf index.php
  data/
    .htaccess                ← blockt direkten Web-Zugriff auf die .sqlite-Datei
    database.sqlite           ← entsteht automatisch beim ersten Request (nicht in Git)
  core/
    Router.php
    Database.php             ← PDO-Singleton + automatischer Migrations-Runner
    Request.php
    Response.php              ← JSON-Helper, Statuscodes
    Auth.php                  ← Session, password_hash/verify, Visibility-Check
  controllers/
    AuthController.php
    HouseholdController.php
    ChildController.php
    FeedController.php
    EventController.php
    CalendarController.php
    NotificationController.php
    AdminController.php
  models/
    User.php, Household.php, Child.php, Pet.php, FeedItem.php, Event.php, EventResponse.php, CalendarEntry.php, ToolListing.php, Notification.php
  migrations/
    001_streets.sql, 002_users.sql, 003_households.sql, … (werden automatisch beim ersten Request angewendet, siehe Database.php)
```

Jeder Controller enthält nur schlanke Methoden (`index`, `show`, `store`, `update`, `destroy`), Geschäftslogik/Queries wandern ins jeweilige Model – hält auch hier Dateien klein und Verantwortlichkeiten klar.

### 9.4 Auth-Mechanismus

PHP-native Sessions (`session_start()`, `$_SESSION['user_id']`), da Frontend (Root) und API (`/api/`) auf derselben Domain/demselben Pfad liegen → **kein CORS**, Cookie funktioniert direkt. `password_hash()`/`password_verify()` für Passwörter. Kein JWT nötig, kein zusätzliches Auth-Package.

---

## 10. API-Konzept

**Basis-URL:** `https://www.red-it.org/apps/neighborhood/api/` · Format: JSON, `Content-Type: application/json`.

**Response-Hülle:**
```json
{ "success": true, "data": { ... }, "error": null }
```

**Kernendpunkte (Auswahl, REST-artig über Mini-Router):**

| Methode | Pfad | Zweck |
|---|---|---|
| POST | /auth/register | Registrierung per Einladungscode |
| POST | /auth/login | Login, setzt Session-Cookie |
| POST | /auth/logout | Session beenden |
| GET | /households/me | eigener Haushalt inkl. Kinder/Haustiere |
| PUT | /households/me | Haushalt/Status/Sichtbarkeit aktualisieren |
| GET | /households | sichtbare Haushalte der Straße (gefiltert nach Visibility) |
| POST | /children | Kind anlegen |
| PUT | /children/:id | Aufenthaltsort ändern |
| GET | /feed | Straßen-Feed (paginiert, Filter nach Typ) |
| POST | /feed | neuen Feed-Post erstellen |
| GET | /events | anstehende Events |
| POST | /events | Event anlegen |
| POST | /events/:id/rsvp | Zusage/Vielleicht/Absage abgeben |
| GET | /calendar?from=&to= | Kalendereinträge im Zeitraum |
| GET | /notifications | eigene Benachrichtigungen |
| GET | /admin/users (nur admin) | Nutzerverwaltung |

Der Mini-Router in `index.php` mappt `$_SERVER['REQUEST_METHOD']` + Pfad-Segmente direkt auf `Controller::methode()` – keine Routing-Bibliothek nötig.

---

## 11. Deployment & lokale Entwicklung

**Struktur auf dem Server (`/apps/neighborhood/`):** Root = gebautes Frontend (`dist/`-Inhalt), Unterordner `api/` = PHP-Backend.

**Deployment-Ablauf:** `npm run deploy` (baut das Frontend und lädt `dist/` + `api/`
automatisch per FTP/FTPS ausschließlich nach `/apps/neighborhood/` hoch, siehe
`scripts/deploy.mjs` und README). Einmalig manuell bleibt nur: `config.php`
direkt auf dem Server anlegen (nie ins Git-Repo, nur `config.example.php` wird
versioniert; die Standardwerte funktionieren unverändert, da SQLite keine
Zugangsdaten braucht). Das DB-Schema muss **nicht** manuell eingespielt werden –
`Database.php` führt beim ersten Request automatisch alle noch nicht
angewendeten Dateien aus `migrations/` aus.
`.htaccess` im Root sorgt für SPA-Fallback (History-API-Routing), `api/.htaccess`
für den Front-Controller, `api/data/.htaccess` blockt direkten Web-Zugriff auf
die SQLite-Datei.

**Lokale Entwicklung (wie gewünscht: nur npm, gegen Live-Backend):**
- `npm run dev` startet den Vite-Devserver.
- `.env.local`: `VITE_API_BASE_URL=https://www.red-it.org/apps/nachbarn/api`
- Kein lokales PHP/SQLite-Setup nötig, um am Frontend zu arbeiten.
- Für Backend-Änderungen: PHP-Dateien lokal editieren (`php -l datei.php` als Syntax-Check reicht, da kein lokaler Server läuft), dann per FTP hochladen und live testen.

**Empfehlung (kein Zwang):** Da Backend-Änderungen direkt live getestet werden, lohnt sich mittelfristig ein einfacher Staging-Unterordner (`/apps/nachbarn-staging/` + eigene Staging-DB), um Nutzer nicht durch fehlerhafte Uploads zu stören. Reine FTP-Lösung, keine zusätzliche Tooling-Abhängigkeit.

---

## 12. Roadmap

**v1.0 – MVP**
Einladungscode-Registrierung, Login, Haushaltsprofil (Adresse, Name, Erwachsene, Kinder, Haustiere), 8 Haushaltsstatus, Dashboard-Grundansicht, Feed mit 8 Kern-Post-Typen, einfacher Kalender (Urlaube + manuelle Termine), Sichtbarkeits-Einstellungen pro Haushalt, Basis-Push (Einladung, neuer Feed-Post), PWA-Grundgerüst (Manifest, Icon, Light/Dark).

**v1.5**
Event-Planung mit vollem RSVP (Zusage/Vielleicht/Absage inkl. "kommt mit allen"/"nur Thomas"), Kinderverwaltung mit allen Aufenthaltsorten inkl. Zeitstempel, restliche Feed-Post-Typen (Gartenparty, spontanes Treffen, Straße gesperrt).

**v2.0**
Mülltonnen-Erinnerungen mit Wiederholungsregel, Werkzeugverleih-Liste inkl. Rückgabe-Erinnerung, Vermisst-Meldungen (Hund/Katze) mit Push an die ganze Straße, Admin-Bereich als UI (Nutzer, Einladungscodes, Moderation), vollständiger Dark Mode, feingeschliffene Sichtbarkeits-Matrix.

**v2.5**
Erweiterte Benachrichtigungs-Einstellungen (pro Kategorie an/aus, "Nicht stören"-Ruhezeiten), Kalender-Export (ICS), Geburtstage optional im Kalender, Admin-Statistiken (Aktivität der Straße).

**v3.0**
Mehrere Straßen/Nachbarschaften (Multi-Tenant über bereits vorbereitetes `street_id`-Schema), Mehrsprachigkeit (DE/EN), Nachbarschaftshilfe-Matching ("wer kann wann helfen"), optionale native App-Hülle (z.B. Capacitor) falls App-Store-Präsenz gewünscht ist.

---

## 13. Offene Punkte / Risiken

- **Direkte Live-Backend-Tests** ohne lokale PHP-Umgebung bergen ein gewisses Risiko für Produktionsfehler – Staging-Ordner (s. Kapitel 11) wird empfohlen, ist aber optional.
- **Einladungscode-Verteilung:** muss außerhalb der App organisiert werden (z.B. durch Admin/Straßensprecher) – kein Zahlungs- oder Fremdauth-System vorgesehen.
- **Push-Notifications** erfordern HTTPS und einen VAPID-Key für Web-Push; technisch einfach, aber Teil des Backends (kleine PHP-Bibliothek für Web-Push nötig oder Eigenbau nach RFC 8291 – hier wäge ich bewusst zwischen "keine Dependencies" und Aufwand ab, Vorschlag: minimaler Eigenbau in `core/WebPush.php`).
- **DSGVO/Datenschutz:** Adressen, Kinderdaten, Standort/Aufenthaltsort sind sensible Daten – Sichtbarkeits-Feinsteuerung (Kapitel 5) ist deshalb kein Nice-to-have, sondern Kernanforderung.
