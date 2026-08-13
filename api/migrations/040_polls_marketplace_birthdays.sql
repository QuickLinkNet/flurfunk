CREATE TABLE IF NOT EXISTS feed_poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_item_id INTEGER NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_poll_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_item_id INTEGER NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES feed_poll_options(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (feed_item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_poll_options_item ON feed_poll_options(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_poll_votes_item ON feed_poll_votes(feed_item_id);

ALTER TABLE users ADD COLUMN birthday_month INTEGER;
ALTER TABLE users ADD COLUMN birthday_day INTEGER;
