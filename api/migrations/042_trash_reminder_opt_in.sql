-- Mülltermin-Erinnerung war bisher automatisch für alle aktiv (Push-Broadcast
-- an alle Abos, E-Mail an alle mit weekly_digest_enabled). Auf Wunsch jetzt
-- per-Nutzer opt-in, standardmäßig aus, damit niemand ungefragt "zugespamt"
-- wird.
ALTER TABLE users ADD COLUMN trash_reminder_push_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN trash_reminder_email_enabled INTEGER NOT NULL DEFAULT 0;
