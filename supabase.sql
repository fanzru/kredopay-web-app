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
    UNIQUE(user_email, card_number)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_user ON virtual_cards(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_intents_user ON spending_intents(user_email);
CREATE INDEX IF NOT EXISTS idx_intents_status ON spending_intents(status);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Enable Row Level Security (RLS) if needed, but for now we'll assume service role or simple access
-- ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
-- ... repeat for others
