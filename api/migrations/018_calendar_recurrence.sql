ALTER TABLE calendar_entries ADD COLUMN recurrence_rule TEXT NOT NULL DEFAULT 'none'
  CHECK (recurrence_rule IN ('none','daily','weekly','monthly'));

ALTER TABLE calendar_entries ADD COLUMN recurrence_until DATETIME;
