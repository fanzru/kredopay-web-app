-- Migration: Add deposit_requests table
-- Run this in Supabase SQL Editor

-- Deposit Requests Table
CREATE TABLE IF NOT EXISTS deposit_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    requested_amount DECIMAL NOT NULL,
    exact_amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USDC',
    unique_code TEXT NOT NULL UNIQUE,
    wallet_address TEXT,
    status TEXT DEFAULT 'pending',
    card_id TEXT REFERENCES virtual_cards (id) ON DELETE SET NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    completed_at BIGINT,
    transaction_hash TEXT
);

-- Note: If you already executed this migration before,
-- run migrations/add-exact-amount-columns.sql instead to add the new columns

-- Indexes for deposit_requests
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposit_requests (user_email);

CREATE INDEX IF NOT EXISTS idx_deposits_code ON deposit_requests (unique_code);

CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposit_requests (status);