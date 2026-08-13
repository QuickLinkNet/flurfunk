-- Erweitert den CHECK-Constraint von feed_items.type um 'poll',
-- 'marketplace_sell', 'marketplace_give' (SQLite kann CHECK-Constraints nicht
-- per ALTER TABLE ändern, siehe Migration 032 für das gleiche Muster).
PRAGMA foreign_keys = OFF;

CREATE TABLE feed_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'vacation','home','visit_expected','garden_party','bbq','spontaneous_meetup',
    'street_closed','package_received','tool_available','help_needed','babysitter_needed',
    'dog_lost','cat_found','trash_reminder','street_event','other',
    'poll','marketplace_sell','marketplace_give'
  )),
  message TEXT,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors','private')),
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'open',
  photo_path TEXT
);

INSERT INTO feed_items_new (
  id, household_id, type, message, visibility, expires_at, created_at, status, photo_path
)
SELECT
  id, household_id, type, message, visibility, expires_at, created_at, status, photo_path
FROM feed_items;

DROP TABLE feed_items;
ALTER TABLE feed_items_new RENAME TO feed_items;

PRAGMA foreign_keys = ON;
