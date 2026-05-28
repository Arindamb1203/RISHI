CREATE TABLE IF NOT EXISTS rishi_error_reports (
  id TEXT PRIMARY KEY,
  name TEXT,
  class TEXT,
  board TEXT,
  phone TEXT,
  page_url TEXT,
  page_name TEXT,
  description TEXT,
  screenshot TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TEXT
);
