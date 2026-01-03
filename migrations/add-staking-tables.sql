-- Migration: Add Staking Tables
-- Created: 2026-01-03
-- Description: Adds user_profiles, staking_positions, staking_rewards, and staking_history tables for $KREDO staking functionality

-- User Profiles Table
-- Stores wallet addresses and $KREDO balances for users
CREATE TABLE IF NOT EXISTS user_profiles (
    user_email TEXT PRIMARY KEY,
    wallet_address TEXT,
    kredo_balance DECIMAL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);

-- Staking Positions Table
-- Tracks active and completed staking positions
CREATE TABLE IF NOT EXISTS staking_positions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    tier TEXT NOT NULL,                    -- BRONZE, SILVER, GOLD, PLATINUM
    apr DECIMAL NOT NULL,                  -- Annual Percentage Rate (includes lock bonus)
    staked_at BIGINT NOT NULL,            -- Timestamp when staked
    unlock_at BIGINT,                      -- Timestamp when unlocked (null = flexible)
    lock_period_days INTEGER DEFAULT 0,    -- 0 = flexible, 30, 90, 180, 365
    status TEXT DEFAULT 'active',          -- active, unstaking, completed
    total_rewards_earned DECIMAL DEFAULT 0,
    last_reward_claim BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);

-- Staking Rewards Table
-- Tracks individual reward accruals
CREATE TABLE IF NOT EXISTS staking_rewards (
    id TEXT PRIMARY KEY,
    position_id TEXT NOT NULL REFERENCES staking_positions(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    reward_type TEXT DEFAULT 'apr',        -- apr, bonus, referral
    claimed BOOLEAN DEFAULT false,
    claimed_at BIGINT,
    accrued_at BIGINT NOT NULL
);

-- Staking History Table
-- Audit log for all staking actions
CREATE TABLE IF NOT EXISTS staking_history (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    position_id TEXT REFERENCES staking_positions(id),
    action TEXT NOT NULL,                  -- stake, unstake, claim_rewards, compound
    amount DECIMAL NOT NULL,
    timestamp BIGINT NOT NULL,
    transaction_hash TEXT
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_staking_user ON staking_positions (user_email);
CREATE INDEX IF NOT EXISTS idx_staking_status ON staking_positions (status);
CREATE INDEX IF NOT EXISTS idx_rewards_position ON staking_rewards (position_id);
CREATE INDEX IF NOT EXISTS idx_rewards_unclaimed ON staking_rewards (claimed) WHERE claimed = false;
CREATE INDEX IF NOT EXISTS idx_staking_history_user ON staking_history (user_email);

-- Comments for Documentation
COMMENT ON TABLE user_profiles IS 'User wallet addresses and $KREDO token balances';
COMMENT ON TABLE staking_positions IS 'Active and historical staking positions with tier and APR info';
COMMENT ON TABLE staking_rewards IS 'Individual reward accruals that can be claimed';
COMMENT ON TABLE staking_history IS 'Audit log of all staking-related actions';

COMMENT ON COLUMN staking_positions.tier IS 'BRONZE (100+), SILVER (1K+), GOLD (10K+), PLATINUM (100K+)';
COMMENT ON COLUMN staking_positions.apr IS 'Base APR + lock bonus (0-20%)';
COMMENT ON COLUMN staking_positions.lock_period_days IS 'Lock period: 0=flexible, 30, 90, 180, 365 days';
COMMENT ON COLUMN staking_rewards.reward_type IS 'Type of reward: apr (standard), bonus (promotional), referral';
