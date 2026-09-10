-- Erwachsenen-Geburtstag jetzt als vollständiges Datum (mit Jahr) statt nur
-- Monat/Tag - einheitliches "date"-Feld im Profil, und das Alter lässt sich
-- damit anzeigen. Bestehende Monat/Tag-Werte können nicht sauber migriert
-- werden (kein Jahr vorhanden), betroffen ist nur ein Nutzer -> neu eintragen.
--
-- Tabelle wird neu aufgebaut wie in Migration 041/043: "ALTER TABLE ... DROP
-- COLUMN" wird vom SQLite des Hosters (< 3.35) nicht unterstützt und hat die
-- Migration beim ersten Versuch mittendrin abgebrochen. Der Rebuild ist
-- bewusst idempotent: die Spalte "birthday" entsteht hier aus dem CREATE und
-- wird im INSERT NICHT referenziert - egal ob die alte users-Tabelle die
-- Spalte durch den Teil-Lauf schon hat oder (frische DB) noch nicht.
PRAGMA foreign_keys = OFF;

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member','guest')),
  avatar_url TEXT,
  notification_prefs TEXT,
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  onboarding_completed_at DATETIME,
  onboarding_current_step TEXT NOT NULL DEFAULT 'household',
  weekly_digest_enabled INTEGER NOT NULL DEFAULT 1,
  avatar_photo_path TEXT,
  trash_reminder_push_enabled INTEGER NOT NULL DEFAULT 0,
  trash_reminder_email_enabled INTEGER NOT NULL DEFAULT 0,
  birthday DATE
);

INSERT INTO users_new (
  id, household_id, email, password_hash, display_name, role, avatar_url,
  notification_prefs, last_login_at, created_at, onboarding_completed_at,
  onboarding_current_step, weekly_digest_enabled, avatar_photo_path,
  trash_reminder_push_enabled, trash_reminder_email_enabled
)
SELECT
  id, household_id, email, password_hash, display_name, role, avatar_url,
  notification_prefs, last_login_at, created_at, onboarding_completed_at,
  onboarding_current_step, weekly_digest_enabled, avatar_photo_path,
  trash_reminder_push_enabled, trash_reminder_email_enabled
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys = ON;
