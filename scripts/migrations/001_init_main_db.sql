-- Migration for Kredo Main Database (D1)
-- Run this with: wrangler d1 execute kredopay-db --file=./scripts/migrations/001_init_main_db.sql

-- Virtual Cards Table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'USDC',
  status TEXT DEFAULT 'active',
  spending_limit REAL,
  created_at INTEGER NOT NULL,
  last_used INTEGER,
  UNIQUE(user_email, card_number)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  merchant TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  FOREIGN KEY (card_id) REFERENCES virtual_cards(id) ON DELETE CASCADE
);

-- Spending Intents Table
CREATE TABLE IF NOT EXISTS spending_intents (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USDC',
  status TEXT DEFAULT 'pending_proof',
  merchant TEXT,
  category TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  proof_hash TEXT,
  executed_at INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_user ON virtual_cards(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_intents_user ON spending_intents(user_email);
CREATE INDEX IF NOT EXISTS idx_intents_status ON spending_intents(status);
