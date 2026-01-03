-- Migration: Seed Initial User Profile for Testing
-- Created: 2026-01-03
-- Description: Creates initial user profile with wallet address and test balance for dev@kredopay.app

-- Insert or update dev user profile
INSERT INTO user_profiles (
    user_email,
    wallet_address,
    kredo_balance,
    created_at,
    updated_at
) VALUES (
    'dev@kredopay.app',
    'F2hgieC18MeUWaWMoyaxLSQCzS7yAjRz1HgmbGAEpump',
    100000,
    EXTRACT(EPOCH FROM NOW()) * 1000,
    EXTRACT(EPOCH FROM NOW()) * 1000
)
ON CONFLICT (user_email) 
DO UPDATE SET
    wallet_address = EXCLUDED.wallet_address,
    kredo_balance = EXCLUDED.kredo_balance,
    updated_at = EXTRACT(EPOCH FROM NOW()) * 1000;

-- Verify insertion
SELECT 
    user_email,
    wallet_address,
    kredo_balance,
    created_at,
    updated_at
FROM user_profiles
WHERE user_email = 'dev@kredopay.app';
