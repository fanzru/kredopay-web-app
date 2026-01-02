import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "auth.db");

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

console.log("Starting OTP database migration...");

try {
  // Start a transaction
  db.exec("BEGIN TRANSACTION");

  // Create a new table without the UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used BOOLEAN DEFAULT 0
    );
  `);

  // Copy data from old table to new table (if old table exists)
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='otp_codes'"
    )
    .get();

  if (tableExists) {
    console.log("Copying data from old table...");
    db.exec(`
      INSERT INTO otp_codes_new (id, email, otp_code, created_at, expires_at, used)
      SELECT id, email, otp_code, created_at, expires_at, used
      FROM otp_codes;
    `);

    // Drop old table
    console.log("Dropping old table...");
    db.exec("DROP TABLE otp_codes;");
  }

  // Rename new table to original name
  console.log("Renaming new table...");
  db.exec("ALTER TABLE otp_codes_new RENAME TO otp_codes;");

  // Create indexes
  console.log("Creating indexes...");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
    CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
  `);

  // Commit transaction
  db.exec("COMMIT");

  console.log("✅ Migration completed successfully!");
} catch (error) {
  console.error("❌ Migration failed:", error);
  db.exec("ROLLBACK");
  process.exit(1);
} finally {
  db.close();
}
