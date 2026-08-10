CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_a_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  household_b_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  last_message_at DATETIME,
  household_a_last_read_at DATETIME,
  household_b_last_read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (household_a_id, household_b_id),
  CHECK (household_a_id < household_b_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_household_a ON conversations(household_a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_household_b ON conversations(household_b_id);
