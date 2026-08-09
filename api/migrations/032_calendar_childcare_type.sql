-- Ergänzt die Kalender-Kategorie "Kinderbetreuung" (z.B. "Kinder bei Papa").
-- SQLite kann CHECK-Constraints nicht per ALTER TABLE ändern, daher wird die
-- Tabelle neu aufgebaut (Daten/IDs bleiben erhalten) - gleiches Muster wie
-- Migration 007 für die streets-Tabelle.
PRAGMA foreign_keys = OFF;

CREATE TABLE calendar_entries_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('vacation','birthday','event','visit','street_action','holiday','trash','appointment','childcare')),
  source_table TEXT,
  source_id INTEGER,
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  all_day INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors','private')),
  recurrence_rule TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_rule IN ('none','daily','weekly','monthly')),
  recurrence_until DATETIME
);

INSERT INTO calendar_entries_new (
  id, type, source_table, source_id, household_id, title, starts_at, ends_at,
  all_day, visibility, recurrence_rule, recurrence_until
)
SELECT
  id, type, source_table, source_id, household_id, title, starts_at, ends_at,
  all_day, visibility, recurrence_rule, recurrence_until
FROM calendar_entries;

DROP TABLE calendar_entries;
ALTER TABLE calendar_entries_new RENAME TO calendar_entries;

PRAGMA foreign_keys = ON;
