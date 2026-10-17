-- Disha backend schema (Cloudflare D1 / SQLite).
-- Times are Unix milliseconds. Secrets (OTP codes, session and consent tokens)
-- are stored only as SHA-256 hashes. IP addresses are stored only as salted hashes.

CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  is_adult       INTEGER,                       -- NULL until the user answers
  parent_email   TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown'
                 CHECK (consent_status IN ('unknown', 'not_required', 'pending', 'granted')),
  consent_at     INTEGER,
  created_at     INTEGER NOT NULL
);

CREATE TABLE otp_codes (
  email      TEXT PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE consent_requests (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  expires_at   INTEGER NOT NULL
);
CREATE INDEX consent_user ON consent_requests(user_id);

-- The student's saved quiz/aptitude progress (the same JSON the app keeps locally).
CREATE TABLE saved_state (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE leads (
  id         TEXT PRIMARY KEY,
  role       TEXT NOT NULL,
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  message    TEXT NOT NULL,
  ip_hash    TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE orders (
  id             TEXT PRIMARY KEY,               -- our reference, sent to Razorpay as reference_id
  user_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  product        TEXT NOT NULL,
  amount_paise   INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  rzp_link_id    TEXT,
  rzp_payment_id TEXT,
  created_at     INTEGER NOT NULL,
  paid_at        INTEGER
);
CREATE INDEX orders_user ON orders(user_id);

-- What a user has bought. expires_at NULL means it never expires.
CREATE TABLE entitlements (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product    TEXT NOT NULL,
  order_id   TEXT NOT NULL,
  expires_at INTEGER,
  PRIMARY KEY (user_id, product)
);

CREATE TABLE booking_requests (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone           TEXT NOT NULL,
  preferred_times TEXT NOT NULL,
  note            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'done', 'cancelled')),
  created_at      INTEGER NOT NULL
);

-- Fixed-window rate limiting.
CREATE TABLE rate_limits (
  key          TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL
);
