-- Ersetzt den einen allgemeinen Straßen-Einladungscode durch personalisierte
-- Codes pro Person, die der Admin beim Anlegen eines Haushalts generiert.
-- SQLite kann UNIQUE-Spalten nicht per DROP COLUMN entfernen, daher wird die
-- streets-Tabelle neu aufgebaut (Daten/IDs bleiben erhalten).
PRAGMA foreign_keys = OFF;

CREATE TABLE streets_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO streets_new (id, name, created_at) SELECT id, name, created_at FROM streets;
DROP TABLE streets;
ALTER TABLE streets_new RENAME TO streets;

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS household_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  used_at DATETIME,
  used_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
