ALTER TABLE household_invites ADD COLUMN email_sent_at DATETIME;
ALTER TABLE household_invites ADD COLUMN email_last_sent_at DATETIME;
ALTER TABLE household_invites ADD COLUMN email_send_count INTEGER NOT NULL DEFAULT 0;
