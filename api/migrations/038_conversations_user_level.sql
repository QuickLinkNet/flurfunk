-- Nachrichten liefen bisher auf Haushalts-Ebene, wodurch zwei Personen im
-- selben Haushalt (z.B. Partner) sich nicht gegenseitig schreiben konnten -
-- ein echter Bug, kein Edge Case, da mehrköpfige Haushalte hier die Regel
-- sind. Es existieren zu diesem Zeitpunkt keine echten Unterhaltungen in
-- Produktion (Messaging setzte zwei verschiedene Haushalte voraus, es gibt
-- aber erst einen echten Haushalt) - daher sauberer Neuaufbau statt
-- Daten-Migration.
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_a_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at DATETIME,
  user_a_last_read_at DATETIME,
  user_b_last_read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_a ON conversations(user_a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_b ON conversations(user_b_id);
