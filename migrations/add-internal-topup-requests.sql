-- Migration: Add Internal Top-Up Requests Table
-- Date: 2026-01-09
-- Description: Adds support for internal top-up via exact amount verification (4-digit decimal)
--              User transfers exact amount (e.g., $20.1024) to Solana wallet for tracking

-- Create internal_topup_requests table
CREATE TABLE IF NOT EXISTS internal_topup_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    requested_amount DECIMAL NOT NULL,      -- User's requested amount (e.g., 20.00)
    exact_amount DECIMAL NOT NULL,          -- Amount with unique 4-digit decimal (e.g., 20.1024)
    decimal_code TEXT NOT NULL,             -- The 4-digit unique code (e.g., "1024")
    currency TEXT DEFAULT 'USDC',
    user_wallet_address TEXT NOT NULL,      -- User's wallet address (for reference)
    solana_wallet_address TEXT NOT NULL,    -- Kredo's Solana wallet (where user sends funds)
    topup_method TEXT NOT NULL,             -- 'wallet_address' or 'moonpay'
    status TEXT DEFAULT 'pending',          -- 'pending', 'approved', 'rejected', 'completed'
    card_id TEXT REFERENCES virtual_cards(id) ON DELETE SET NULL,
    created_at BIGINT NOT NULL,
    approved_at BIGINT,
    approved_by TEXT,
    completed_at BIGINT,
    rejected_at BIGINT,
    rejection_reason TEXT,
    admin_notes TEXT,
    transaction_hash TEXT,                  -- Solana transaction hash
    moonpay_transaction_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_topup_user ON internal_topup_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_internal_topup_status ON internal_topup_requests(status);
CREATE INDEX IF NOT EXISTS idx_internal_topup_method ON internal_topup_requests(topup_method);
CREATE INDEX IF NOT EXISTS idx_internal_topup_created ON internal_topup_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_topup_exact_amount ON internal_topup_requests(exact_amount);
CREATE INDEX IF NOT EXISTS idx_internal_topup_decimal_code ON internal_topup_requests(decimal_code);

-- Add comment to table
COMMENT ON TABLE internal_topup_requests IS 'Stores internal top-up requests with exact amount verification (4-digit decimal)';

-- Add comments to columns
COMMENT ON COLUMN internal_topup_requests.id IS 'Unique identifier, format: ITOP-{timestamp}-{random}';
COMMENT ON COLUMN internal_topup_requests.requested_amount IS 'User requested amount (e.g., 20.00)';
COMMENT ON COLUMN internal_topup_requests.exact_amount IS 'Exact amount to transfer with unique decimal (e.g., 20.1024)';
COMMENT ON COLUMN internal_topup_requests.decimal_code IS '4-digit unique verification code (e.g., "1024")';
COMMENT ON COLUMN internal_topup_requests.solana_wallet_address IS 'Kredo Solana wallet address where user sends funds';
COMMENT ON COLUMN internal_topup_requests.topup_method IS 'Method used: wallet_address or moonpay';
COMMENT ON COLUMN internal_topup_requests.status IS 'Request status: pending, approved, rejected, completed';
COMMENT ON COLUMN internal_topup_requests.user_wallet_address IS 'User wallet address for reference';
COMMENT ON COLUMN internal_topup_requests.approved_by IS 'Email of admin who approved the request';
COMMENT ON COLUMN internal_topup_requests.admin_notes IS 'Internal notes from admin for audit trail';
COMMENT ON COLUMN internal_topup_requests.transaction_hash IS 'Solana blockchain transaction hash';
COMMENT ON COLUMN internal_topup_requests.moonpay_transaction_id IS 'MoonPay transaction ID for future integration';

-- Grant permissions (adjust based on your Supabase setup)
-- Uncomment if using RLS (Row Level Security)
-- ALTER TABLE internal_topup_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own requests
-- CREATE POLICY "Users can view their own top-up requests"
--   ON internal_topup_requests
--   FOR SELECT
--   USING (auth.email() = user_email);

-- Create policy for users to create their own requests
-- CREATE POLICY "Users can create their own top-up requests"
--   ON internal_topup_requests
--   FOR INSERT
--   WITH CHECK (auth.email() = user_email);
