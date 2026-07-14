CREATE TABLE IF NOT EXISTS dashboard_notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dashboard_notices (title, message, is_active)
SELECT 'Kanalreinigung am 24.05.', 'Bitte Parkplätze freihalten.', 1
WHERE NOT EXISTS (SELECT 1 FROM dashboard_notices);
