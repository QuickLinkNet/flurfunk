CREATE TABLE IF NOT EXISTS households (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  street_id INTEGER NOT NULL REFERENCES streets(id),
  name TEXT NOT NULL,
  address_line TEXT NOT NULL,
  status_emoji TEXT NOT NULL DEFAULT '🏠',
  status_label TEXT NOT NULL DEFAULT 'Zuhause',
  status_note TEXT,
  status_updated_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
