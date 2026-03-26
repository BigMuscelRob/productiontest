-- TT-Tournament 2026 – User Schema
-- Run this once to initialize the database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example: Insert first admin (run manually after first deploy)
-- Replace the password_hash with a bcrypt hash of your chosen password.
-- You can generate one at: https://bcrypt.online/ (cost factor 12)
--
-- INSERT INTO users (name, username, password_hash, role)
-- VALUES ('Administrator', 'admin', '$2b$12$YOUR_HASH_HERE', 'admin');
