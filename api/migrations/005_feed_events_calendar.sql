CREATE TABLE IF NOT EXISTS feed_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id),
  type TEXT NOT NULL CHECK (type IN (
    'vacation','home','visit_expected','garden_party','bbq','spontaneous_meetup',
    'street_closed','package_received','tool_available','help_needed','babysitter_needed',
    'dog_lost','cat_found','trash_reminder','street_event','other'
  )),
  message TEXT,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors','private')),
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_household_id INTEGER NOT NULL REFERENCES households(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'bbq','campfire','street_festival','kids_play','football','pool_party',
    'mulled_wine','christmas_party','other'
  )),
  description TEXT,
  location TEXT,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  household_id INTEGER NOT NULL REFERENCES households(id),
  response TEXT NOT NULL CHECK (response IN ('yes','maybe','no')),
  adults_count INTEGER,
  children_count INTEGER,
  note TEXT,
  responded_by_user_id INTEGER NOT NULL REFERENCES users(id),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, household_id)
);

CREATE TABLE IF NOT EXISTS calendar_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('vacation','birthday','event','visit','street_action','holiday','trash','appointment')),
  source_table TEXT,
  source_id INTEGER,
  household_id INTEGER REFERENCES households(id),
  title TEXT NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  all_day INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors','private'))
);

CREATE TABLE IF NOT EXISTS household_visibility_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id),
  field_key TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'neighbors' CHECK (visibility IN ('public','neighbors','private')),
  UNIQUE (household_id, field_key)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  payload TEXT,
  read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
