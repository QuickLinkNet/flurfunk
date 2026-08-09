CREATE TABLE IF NOT EXISTS event_polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public', 'neighbors')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  resulting_event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL REFERENCES event_polls(id) ON DELETE CASCADE,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME
);

CREATE TABLE IF NOT EXISTS event_poll_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  option_id INTEGER NOT NULL REFERENCES event_poll_options(id) ON DELETE CASCADE,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yes', 'maybe', 'no')),
  voted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(option_id, household_id)
);
