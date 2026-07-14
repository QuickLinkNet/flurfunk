# Datenbank-Strategie

## Ziel

Bis das finale Datenmodell steht, soll die App schnell iterierbar bleiben. Dafür nutzen wir weiterhin SQLite und Migrationen, ergänzen aber einen expliziten lokalen Reset-/Seed-Modus.

## Grundregeln

- Normale Entwicklung läuft über `api/migrations/*.sql`.
- Reset ist destruktiv und wird nie automatisch beim Deploy ausgeführt.
- Reset läuft nur lokal per CLI-Script.
- Demo-Daten sollen das Dashboard realistisch befüllen.
- Produktionsdaten werden nicht automatisch verändert.

## Reset-Modus

Das Script `scripts/reset-db.php` ist absichtlich CLI-only und verlangt `--yes`.

Geplantes Verhalten:

1. `api/data/database.sqlite` löschen, falls vorhanden.
2. Migrationen über `App\Core\Database::pdo()` neu ausführen.
3. Demo-Daten einspielen.
4. Demo-Logins ausgeben.

## Seed-Daten

Der Demo-Seed soll fachliche Screens abdecken:

- Straße: `Musterstraße 12`
- Haushalte mit unterschiedlichen Status
- Admin und mehrere Demo-Nutzer
- Kinder mit Aufenthaltsorten/Aktivitäten
- Haustiere
- Straßen-Updates
- Events und Kalendertermine
- Mülltermine zunächst als `calendar_entries`
- Urlaub zunächst als `feed_items` und `calendar_entries`
- Einladungscodes für Onboarding-Tests

## Kommende Modell-Erweiterungen

Wahrscheinliche Tabellen für das Dashboard:

- `person_statuses`: Status pro Person statt nur Haushalt
- `street_notices`: wichtige/pinned Hinweise
- `waste_pickups`: Mülltermine strukturiert statt nur Kalender
- `vacations`: Urlaubsstatus mit Zeitraum
- `dashboard_preferences`: später optionale Karten-/Reihenfolge-Einstellungen

## Produktionsschutz

Falls später ein Web-Reset gebraucht wird:

- nur Admin
- zusätzlicher Secret-Key aus nicht versionierter Config
- klare UI-Warnung
- niemals ohne explizite Bestätigung

Bis dahin bleibt Reset ausschließlich CLI.
