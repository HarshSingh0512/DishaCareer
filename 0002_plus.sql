-- Disha Plus: personal calendar profile, monthly reminders and term snapshots.

-- What the calendar needs to know (sent by the student's browser from their results).
CREATE TABLE plus_profiles (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stage      TEXT NOT NULL CHECK (stage IN ('m', 's', 'h', 'c')),
  stream     TEXT,
  exams      TEXT NOT NULL,                 -- JSON array of exam names from the student's top careers
  reminders  INTEGER NOT NULL DEFAULT 0,    -- 1 = email a digest on the 1st of each month
  last_sent  TEXT,                          -- 'YYYY-MM' of the last digest, so each month is sent once
  updated_at INTEGER NOT NULL
);

-- One row per saved term: scores and top careers at that moment.
CREATE TABLE result_snapshots (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL,                 -- JSON: { stage, riasec, b5, apt, top }
  created_at INTEGER NOT NULL
);
CREATE INDEX snapshots_user ON result_snapshots(user_id, created_at);
