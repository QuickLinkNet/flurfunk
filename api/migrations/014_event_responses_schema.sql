PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS event_responses_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yes','maybe','no')),
  adults_count INTEGER,
  children_count INTEGER,
  note TEXT,
  responded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, household_id)
);

INSERT OR IGNORE INTO event_responses_new (
  id,
  event_id,
  household_id,
  response,
  adults_count,
  children_count,
  note,
  responded_by_user_id,
  updated_at
)
SELECT
  id,
  event_id,
  household_id,
  response,
  NULL,
  NULL,
  NULL,
  NULL,
  CURRENT_TIMESTAMP
FROM event_responses;

DROP TABLE event_responses;
ALTER TABLE event_responses_new RENAME TO event_responses;

PRAGMA foreign_keys = ON;
