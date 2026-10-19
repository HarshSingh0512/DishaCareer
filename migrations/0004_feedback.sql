-- "Do your top 3 careers feel right?" ratings, to measure how accurate matching is.
-- Anonymous: no IDs, no IPs, no answers, no time of day. Only the day, the matching
-- method shown (for comparing O*NET vs Holland codes), the class band, the rating
-- and the three career ids that were rated.
CREATE TABLE match_feedback (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  day    TEXT    NOT NULL,                                          -- YYYY-MM-DD
  method TEXT    NOT NULL CHECK (method IN ('onet', 'holland')),
  stage  TEXT    CHECK (stage IN ('m', 's', 'h', 'c')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  top1   TEXT    NOT NULL,
  top2   TEXT,
  top3   TEXT
);
CREATE INDEX match_feedback_method ON match_feedback (method, day);
