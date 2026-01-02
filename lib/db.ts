import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Use a global variable to store the database connection in development
// to prevent creating multiple connections during hot-reloading
const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined;
};

const dbPath = path.join(process.cwd(), "data", "kredo.db");

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;
try {
  db = globalForDb.db ?? new Database(dbPath);
} catch (error) {
  console.error("Failed to initialize database:", error);
  throw new Error(
    `Database initialization failed. Please ensure better-sqlite3 native bindings are installed. Run: npm rebuild better-sqlite3`
  );
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
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

  CREATE INDEX IF NOT EXISTS idx_cards_user ON virtual_cards(user_email);
  CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_email);
`);

export default db;
