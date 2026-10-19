-- Public site counters shown on the home page and footer.
-- Anonymous totals only: no IDs, no IPs, nothing per person.
CREATE TABLE site_stats (
  key   TEXT PRIMARY KEY CHECK (key IN ('visitors', 'visits', 'quizzes')),
  value INTEGER NOT NULL DEFAULT 0
);
