import Database from "better-sqlite3";
import path from "path";
import type { D1Database } from "./db-adapter";

// OTP Database schema
export const OTP_SCHEMA = `
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    used BOOLEAN DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
  CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
`;

/**
 * Initialize SQLite database for local development
 */
function initSQLite(): Database.Database {
  const dbPath = path.join(process.cwd(), "data", "auth.db");
  const db = new Database(dbPath);

  // Initialize OTP table
  db.exec(OTP_SCHEMA);

  return db;
}

/**
 * Get OTP database instance
 * Returns SQLite for local development, D1 for Cloudflare
 */
export function getOTPDatabase(env?: {
  AUTH_DB?: D1Database;
}): Database.Database | D1Database {
  // If running on Cloudflare and D1 binding is available
  if (env?.AUTH_DB) {
    return env.AUTH_DB;
  }

  // Otherwise use SQLite for local development
  return initSQLite();
}

export interface OTPRecord {
  id: number;
  email: string;
  otp_code: string;
  created_at: number;
  expires_at: number;
  used: boolean;
}

export class OTPDatabase {
  /**
   * Create a new OTP code for an email
   * OTP expires in 10 minutes
   */
  static async createOTP(
    email: string,
    otpCode: string,
    db?: Database.Database | D1Database
  ): Promise<void> {
    const database = db || initSQLite();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Check if it's D1 or SQLite
    const isD1 = "prepare" in database && !("transaction" in database);

    if (isD1) {
      // D1 implementation
      const d1db = database as D1Database;

      // Delete any existing unused OTPs for this email
      await d1db
        .prepare("DELETE FROM otp_codes WHERE email = ? AND used = 0")
        .bind(email)
        .run();

      // Insert new OTP
      await d1db
        .prepare(
          "INSERT INTO otp_codes (email, otp_code, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)"
        )
        .bind(email, otpCode, now, expiresAt)
        .run();
    } else {
      // SQLite implementation
      const sqliteDb = database as Database.Database;

      const transaction = sqliteDb.transaction(() => {
        // Delete any existing unused OTPs for this email
        sqliteDb
          .prepare("DELETE FROM otp_codes WHERE email = ? AND used = 0")
          .run(email);

        // Insert new OTP
        sqliteDb
          .prepare(
            "INSERT INTO otp_codes (email, otp_code, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)"
          )
          .run(email, otpCode, now, expiresAt);
      });

      transaction();
    }
  }

  /**
   * Verify OTP code for an email
   * Returns true if valid and not expired
   */
  static async verifyOTP(
    email: string,
    otpCode: string,
    db?: Database.Database | D1Database
  ): Promise<boolean> {
    const database = db || initSQLite();
    const now = Date.now();

    // Check if it's D1 or SQLite
    const isD1 = "prepare" in database && !("transaction" in database);

    if (isD1) {
      // D1 implementation
      const d1db = database as D1Database;

      const record = await d1db
        .prepare(
          `
        SELECT * FROM otp_codes 
        WHERE email = ? 
          AND otp_code = ? 
          AND used = 0 
          AND expires_at > ?
        ORDER BY created_at DESC 
        LIMIT 1
      `
        )
        .bind(email, otpCode, now)
        .first<OTPRecord>();

      if (!record) {
        return false;
      }

      // Mark OTP as used
      await d1db
        .prepare("UPDATE otp_codes SET used = 1 WHERE id = ?")
        .bind(record.id)
        .run();

      return true;
    } else {
      // SQLite implementation
      const sqliteDb = database as Database.Database;

      const record = sqliteDb
        .prepare(
          `
        SELECT * FROM otp_codes 
        WHERE email = ? 
          AND otp_code = ? 
          AND used = 0 
          AND expires_at > ?
        ORDER BY created_at DESC 
        LIMIT 1
      `
        )
        .get(email, otpCode, now) as OTPRecord | undefined;

      if (!record) {
        return false;
      }

      // Mark OTP as used
      sqliteDb
        .prepare("UPDATE otp_codes SET used = 1 WHERE id = ?")
        .run(record.id);

      return true;
    }
  }

  /**
   * Clean up expired OTPs (older than 1 hour)
   */
  static async cleanupExpiredOTPs(
    db?: Database.Database | D1Database
  ): Promise<void> {
    const database = db || initSQLite();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Check if it's D1 or SQLite
    const isD1 = "prepare" in database && !("transaction" in database);

    if (isD1) {
      const d1db = database as D1Database;
      await d1db
        .prepare("DELETE FROM otp_codes WHERE created_at < ?")
        .bind(oneHourAgo)
        .run();
    } else {
      const sqliteDb = database as Database.Database;
      sqliteDb
        .prepare("DELETE FROM otp_codes WHERE created_at < ?")
        .run(oneHourAgo);
    }
  }

  /**
   * Get latest OTP for email (for dev/testing purposes)
   */
  static async getLatestOTP(
    email: string,
    db?: Database.Database | D1Database
  ): Promise<OTPRecord | undefined> {
    const database = db || initSQLite();

    // Check if it's D1 or SQLite
    const isD1 = "prepare" in database && !("transaction" in database);

    if (isD1) {
      const d1db = database as D1Database;
      const record = await d1db
        .prepare(
          "SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
        )
        .bind(email)
        .first<OTPRecord>();

      return record ?? undefined;
    } else {
      const sqliteDb = database as Database.Database;
      return sqliteDb
        .prepare(
          "SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(email) as OTPRecord | undefined;
    }
  }
}

// Export default SQLite instance for backward compatibility
const db = initSQLite();
export default db;
