-- RISHI D1 Database Schema
-- Cloudflare D1 (SQLite-compatible)
-- Binding name: DB

-- Per-student key/value store (used by rishi-sync.js)
CREATE TABLE IF NOT EXISTS student_data (
  student_id TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  PRIMARY KEY (student_id, key)
);

CREATE INDEX IF NOT EXISTS idx_student_data_sid ON student_data(student_id);

-- Registrations (all students across devices)
CREATE TABLE IF NOT EXISTS registrations (
  student_id      TEXT PRIMARY KEY,      -- e.g. dabeet8171
  student_name    TEXT NOT NULL,
  parent_id       TEXT NOT NULL,         -- e.g. priyanka47522
  parent_name     TEXT,
  primary_mobile  TEXT,
  board           TEXT DEFAULT 'CBSE',
  class           TEXT DEFAULT '8',
  password_hash   TEXT,
  subscription_status TEXT DEFAULT 'trial',  -- trial / subscribed / discontinued
  subscription_expiry TEXT,
  discontinued_date   TEXT,
  rejoined_date       TEXT,
  registered_at   INTEGER DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_reg_parent ON registrations(parent_id);
CREATE INDEX IF NOT EXISTS idx_reg_mobile ON registrations(primary_mobile);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id     TEXT NOT NULL,
  amount         INTEGER NOT NULL,        -- in paise (599 INR = 59900)
  currency       TEXT DEFAULT 'INR',
  status         TEXT DEFAULT 'pending',  -- pending / success / failed
  txn_id         TEXT,
  paid_at        INTEGER,
  created_at     INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (student_id) REFERENCES registrations(student_id)
);

CREATE INDEX IF NOT EXISTS idx_pay_sid ON payments(student_id);

-- Password reset / change requests
CREATE TABLE IF NOT EXISTS password_resets (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT NOT NULL,
  user_type      TEXT NOT NULL,           -- parent / student
  mobile         TEXT NOT NULL,
  otp_hash       TEXT,
  status         TEXT DEFAULT 'pending',  -- pending / verified / expired
  created_at     INTEGER DEFAULT (strftime('%s','now')),
  expires_at     INTEGER
);

-- Notes: Run via wrangler d1 execute
-- wrangler d1 execute RISHI_DB --file database/schema.sql
