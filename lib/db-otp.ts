import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "auth.db");
const db = new Database(dbPath);

// Initialize OTP table
db.exec(`
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    used BOOLEAN DEFAULT 0,
    UNIQUE(email, otp_code)
  );

  CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
  CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
`);

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
  static createOTP(email: string, otpCode: string): void {
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Delete any existing unused OTPs for this email
    db.prepare("DELETE FROM otp_codes WHERE email = ? AND used = 0").run(email);

    // Insert new OTP
    db.prepare(
      "INSERT INTO otp_codes (email, otp_code, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)"
    ).run(email, otpCode, now, expiresAt);
  }

  /**
   * Verify OTP code for an email
   * Returns true if valid and not expired
   */
  static verifyOTP(email: string, otpCode: string): boolean {
    const now = Date.now();

    const record = db
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
    db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(record.id);

    return true;
  }

  /**
   * Clean up expired OTPs (older than 1 hour)
   */
  static cleanupExpiredOTPs(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    db.prepare("DELETE FROM otp_codes WHERE created_at < ?").run(oneHourAgo);
  }

  /**
   * Get latest OTP for email (for dev/testing purposes)
   */
  static getLatestOTP(email: string): OTPRecord | undefined {
    return db
      .prepare(
        "SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
      )
      .get(email) as OTPRecord | undefined;
  }
}

export default db;
