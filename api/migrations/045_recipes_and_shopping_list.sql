-- Rezepte: eigene Tabelle statt feed_items-Typ, weil die Datenform (Zutaten,
-- Zubereitung, Portionen, Dauer, Schwierigkeit) nicht zum generischen
-- "message"-Feld des Feeds passt. Bewusst OHNE visibility-Spalte - Rezepte
-- sind immer für die ganze Nachbarschaft sichtbar (siehe Vorgabe), nur
-- Kommentare/Reaktionen wie beim Feed.
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  photo_path TEXT,
  prep_minutes INTEGER,
  servings INTEGER,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Feste Tag-Auswahl (Schnell/Familie/Vegetarisch/Backen/...) statt Freitext,
-- damit die Filter-Pillen sinnvoll bleiben - siehe RecipeController::TAGS.
CREATE TABLE IF NOT EXISTS recipe_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag ON recipe_tags(tag);

-- Gleiche Form wie feed_comments/feed_reactions (siehe Migration 010).
CREATE TABLE IF NOT EXISTS recipe_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (recipe_id, user_id)
);

-- Einkaufsliste: bewusst pro Haushalt (wie Kinder/Haustiere), nicht für die
-- Nachbarschaft sichtbar - reine private Haushalts-Checkliste, kein
-- Auto-Abgleich mit Rezepten (das ist der spaeter geplante, groessere Teil).
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity TEXT,
  is_done INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shopping_list_household ON shopping_list_items(household_id);
