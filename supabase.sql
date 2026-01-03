-- Virtual Cards
CREATE TABLE IF NOT EXISTS virtual_cards (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    card_number TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    cvv TEXT NOT NULL,
    balance DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'USDC',
    status TEXT DEFAULT 'active',
    spending_limit DECIMAL,
    created_at BIGINT NOT NULL,
    last_used BIGINT,
    UNIQUE (user_email, card_number)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES virtual_cards (id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    merchant TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    status TEXT DEFAULT 'completed'
);

-- Spending Intents
CREATE TABLE IF NOT EXISTS spending_intents (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USDC',
    status TEXT DEFAULT 'pending_proof',
    merchant TEXT,
    category TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT,
    proof_hash TEXT,
    executed_at BIGINT
);

-- OTP Codes
CREATE TABLE IF NOT EXISTS otp_codes (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    used BOOLEAN DEFAULT false
);

-- Deposit Requests
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_user ON virtual_cards (user_email);

CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions (card_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_email);

CREATE INDEX IF NOT EXISTS idx_intents_user ON spending_intents (user_email);

CREATE INDEX IF NOT EXISTS idx_intents_status ON spending_intents (status);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes (email);

CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes (expires_at);

CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposit_requests (user_email);

CREATE INDEX IF NOT EXISTS idx_deposits_code ON deposit_requests (unique_code);

CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposit_requests (status);

-- User Profiles (for wallet addresses)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_email TEXT PRIMARY KEY,
    wallet_address TEXT,
    kredo_balance DECIMAL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);

-- Staking Positions
CREATE TABLE IF NOT EXISTS staking_positions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    tier TEXT NOT NULL,
    apr DECIMAL NOT NULL,
    staked_at BIGINT NOT NULL,
    unlock_at BIGINT,
    lock_period_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    total_rewards_earned DECIMAL DEFAULT 0,
    last_reward_claim BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);

-- Staking Rewards
CREATE TABLE IF NOT EXISTS staking_rewards (
    id TEXT PRIMARY KEY,
    position_id TEXT NOT NULL REFERENCES staking_positions(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    reward_type TEXT DEFAULT 'apr',
    claimed BOOLEAN DEFAULT false,
    claimed_at BIGINT,
    accrued_at BIGINT NOT NULL
);

-- Staking History
CREATE TABLE IF NOT EXISTS staking_history (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    position_id TEXT REFERENCES staking_positions(id),
    action TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    timestamp BIGINT NOT NULL,
    transaction_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_staking_user ON staking_positions (user_email);

CREATE INDEX IF NOT EXISTS idx_staking_status ON staking_positions (status);

CREATE INDEX IF NOT EXISTS idx_rewards_position ON staking_rewards (position_id);

CREATE INDEX IF NOT EXISTS idx_rewards_unclaimed ON staking_rewards (claimed) WHERE claimed = false;

CREATE INDEX IF NOT EXISTS idx_staking_history_user ON staking_history (user_email);

-- Enable Row Level Security (RLS) if needed, but for now we'll assume service role or simple access
-- ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
-- ... repeat for others