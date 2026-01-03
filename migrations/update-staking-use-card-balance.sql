-- Migration: Update Staking to Use Virtual Card Balance
-- Created: 2026-01-03
-- Description: Changes staking system to use total balance from virtual_cards instead of user_profiles.kredo_balance
-- SAFE: No data deletion, only adds views, functions, and triggers

-- IMPORTANT: This migration modifies the staking system to calculate balance from virtual cards
-- The user_profiles.kredo_balance field will be deprecated in favor of summing virtual_cards.balance

-- ============================================================================
-- Step 1: Add a view for total card balance per user
-- ============================================================================
-- This view calculates the total balance from all active virtual cards
-- SAFE: CREATE OR REPLACE VIEW does not delete data
CREATE OR REPLACE VIEW user_total_balance AS
SELECT 
    user_email,
    COALESCE(SUM(balance), 0) as total_balance,
    COUNT(*) as card_count
FROM virtual_cards
WHERE status = 'active'
GROUP BY user_email;

COMMENT ON VIEW user_total_balance IS 'Calculates total balance from all active virtual cards per user. Used for staking balance calculations.';

-- ============================================================================
-- Step 2: Mark kredo_balance field as deprecated (does not delete column)
-- ============================================================================
-- SAFE: Only adds a comment, does not modify or delete data
COMMENT ON COLUMN user_profiles.kredo_balance IS 'DEPRECATED: Use user_total_balance view instead. Balance is now calculated from virtual_cards.balance';

-- ============================================================================
-- Step 3: Create function to get user's stakeable balance
-- ============================================================================
-- This returns the total balance from all active virtual cards
-- SAFE: CREATE OR REPLACE FUNCTION does not delete data
CREATE OR REPLACE FUNCTION get_stakeable_balance(p_user_email TEXT)
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(balance) FROM virtual_cards WHERE user_email = p_user_email AND status = 'active'),
        0
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_stakeable_balance(TEXT) IS 'Returns total stakeable balance from active virtual cards for a given user email';

-- ============================================================================
-- Step 4: Create trigger function to prevent over-staking
-- ============================================================================
-- SAFE: CREATE OR REPLACE FUNCTION does not delete data
CREATE OR REPLACE FUNCTION check_stakeable_balance()
RETURNS TRIGGER AS $$
DECLARE
    available_balance DECIMAL;
    total_staked DECIMAL;
BEGIN
    -- Get total balance from cards
    available_balance := get_stakeable_balance(NEW.user_email);
    
    -- Get total already staked
    total_staked := COALESCE(
        (SELECT SUM(amount) FROM staking_positions 
         WHERE user_email = NEW.user_email AND status = 'active'),
        0
    );
    
    -- Check if new stake would exceed available balance
    IF (total_staked + NEW.amount) > available_balance THEN
        RAISE EXCEPTION 'Insufficient balance. Available: %, Already staked: %, Attempting to stake: %', 
            available_balance, total_staked, NEW.amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_stakeable_balance() IS 'Trigger function to prevent staking more than available card balance';

-- ============================================================================
-- Step 5: Apply trigger to staking_positions table
-- ============================================================================
-- WARNING: This is the "destructive" operation that triggers the warning
-- SAFE: Only drops and recreates the trigger, does not affect data
-- The trigger is immediately recreated, so there's no gap in protection
DROP TRIGGER IF EXISTS check_balance_before_stake ON staking_positions;

CREATE TRIGGER check_balance_before_stake
    BEFORE INSERT ON staking_positions
    FOR EACH ROW
    EXECUTE FUNCTION check_stakeable_balance();

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification query (uncomment and run after migration to verify)
/*
SELECT 
    vb.user_email,
    vb.total_balance as card_balance,
    vb.card_count,
    up.kredo_balance as old_balance_field,
    COALESCE(SUM(sp.amount), 0) as total_staked,
    vb.total_balance - COALESCE(SUM(sp.amount), 0) as available_to_stake
FROM user_total_balance vb
LEFT JOIN user_profiles up ON vb.user_email = up.user_email
LEFT JOIN staking_positions sp ON vb.user_email = sp.user_email AND sp.status = 'active'
GROUP BY vb.user_email, vb.total_balance, vb.card_count, up.kredo_balance
ORDER BY vb.user_email;
*/

-- ============================================================================
-- SAFETY NOTES:
-- ============================================================================
-- 1. No data is deleted from any table
-- 2. user_profiles.kredo_balance column is NOT dropped, only marked as deprecated
-- 3. The only "destructive" operation is DROP TRIGGER, which is immediately recreated
-- 4. All CREATE OR REPLACE operations are safe and idempotent
-- 5. This migration can be run multiple times safely
-- ============================================================================
