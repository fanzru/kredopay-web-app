-- Migration for Kredo Auth Database (D1)
-- Run this with: wrangler d1 execute kredopay-auth-db --file=./scripts/migrations/002_init_auth_db.sql

-- OTP Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used BOOLEAN DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
