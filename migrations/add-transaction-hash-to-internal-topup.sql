-- Migration: Add transaction_hash column to existing internal_topup_requests table
-- Date: 2026-01-09
-- Description: Adds transaction_hash column if it doesn't exist (for existing tables)

-- Add transaction_hash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'internal_topup_requests' 
        AND column_name = 'transaction_hash'
    ) THEN
        ALTER TABLE internal_topup_requests 
        ADD COLUMN transaction_hash TEXT;
        
        -- Add comment
        COMMENT ON COLUMN internal_topup_requests.transaction_hash IS 'Solana blockchain transaction hash';
    END IF;
END $$;

-- Update status column comment to include 'verifying' status
COMMENT ON COLUMN internal_topup_requests.status IS 'Request status: pending, verifying, approved, rejected, completed';
