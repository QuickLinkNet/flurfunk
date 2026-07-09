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

-- Bootstrap: ohne Admin-Panel-Zugriff kann niemand einen Einladungscode
-- erzeugen, also niemand sich registrieren - klassisches Henne-Ei-Problem.
-- Nur falls noch gar keine Nutzer existieren, wird ein einziger fester
-- Start-Code angelegt. Der erste, der ihn einlöst, wird automatisch Admin
-- (siehe AuthController::register) und kann danach im Admin-Bereich echte
-- Haushalte mit richtigen Namen/Adressen samt eigenen Codes anlegen.
INSERT INTO households (street_id, name, address_line, status_emoji, status_label, created_at)
SELECT id, 'Erster Haushalt', 'bitte in der Verwaltung anpassen', '🏠', 'Zuhause', CURRENT_TIMESTAMP
FROM streets
WHERE NOT EXISTS (SELECT 1 FROM users)
ORDER BY id LIMIT 1;

INSERT INTO household_invites (household_id, code, first_name, last_name, created_at)
SELECT last_insert_rowid(), 'ADMIN001', 'Admin', 'Account', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users);
