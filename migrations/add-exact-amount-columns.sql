-- Migration: Add requested_amount and exact_amount columns to deposit_requests
-- Run this in Supabase SQL Editor if you already have deposit_requests table

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add requested_amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'deposit_requests' 
        AND column_name = 'requested_amount'
    ) THEN
        ALTER TABLE deposit_requests 
        ADD COLUMN requested_amount DECIMAL;
        
        -- Migrate existing data: set requested_amount = amount for existing records
        UPDATE deposit_requests 
        SET requested_amount = amount::DECIMAL
        WHERE requested_amount IS NULL;
        
        -- Make it NOT NULL after migration
        ALTER TABLE deposit_requests 
        ALTER COLUMN requested_amount SET NOT NULL;
    END IF;

    -- Add exact_amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'deposit_requests' 
        AND column_name = 'exact_amount'
    ) THEN
        ALTER TABLE deposit_requests 
        ADD COLUMN exact_amount DECIMAL;
        
        -- Migrate existing data: set exact_amount = amount for existing records
        UPDATE deposit_requests 
        SET exact_amount = amount::DECIMAL
        WHERE exact_amount IS NULL;
        
        -- Make it NOT NULL after migration
        ALTER TABLE deposit_requests 
        ALTER COLUMN exact_amount SET NOT NULL;
    END IF;
END $$;

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'deposit_requests'
    AND column_name IN (
        'requested_amount',
        'exact_amount',
        'amount'
    )
ORDER BY column_name;