import { supabase } from "@/lib/supabase";

export interface OtpCode {
  id: string;
  email: string;
  otpCode: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

export class OTPDatabase {
  /**
   * Create a new OTP code for an email
   */
  static async createOTP(email: string, otpCode: string): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + 10 * 60 * 1000; // 10 minutes

      // Delete any existing unused OTPs for this email
      await supabase
        .from("otp_codes")
        .delete()
        .eq("email", email)
        .eq("used", false);

      // Insert new OTP
      const { error } = await supabase.from("otp_codes").insert({
        email,
        otp_code: otpCode,
        created_at: now,
        expires_at: expiresAt,
        used: false,
      });

      if (error) {
        throw new Error(`Failed to create OTP: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("relation") ||
          error.message.includes("does not exist")
        ) {
          throw new Error(
            `Database table 'otp_codes' does not exist. Please run migrations to create the table.`
          );
        }
        throw error;
      }
      throw new Error("Unknown error creating OTP");
    }
  }

  /**
   * Verify OTP code for an email
   */
  static async verifyOTP(email: string, otpCode: string): Promise<boolean> {
    try {
      const now = Date.now();

      // Find valid OTP
      const { data: records, error: selectError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", email)
        .eq("otp_code", otpCode)
        .eq("used", false)
        .gt("expires_at", now)
        .order("created_at", { ascending: true })
        .limit(1);

      if (selectError) {
        throw new Error(`Failed to verify OTP: ${selectError.message}`);
      }

      if (!records || records.length === 0) {
        return false;
      }

      const record = records[0];

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", record.id);

      if (updateError) {
        throw new Error(`Failed to mark OTP as used: ${updateError.message}`);
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("relation") ||
          error.message.includes("does not exist")
        ) {
          throw new Error(
            `Database table 'otp_codes' does not exist. Please run migrations to create the table.`
          );
        }
        throw error;
      }
      throw new Error("Unknown error verifying OTP");
    }
  }

  /**
   * Clean up expired OTPs (older than 1 hour)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      await supabase.from("otp_codes").delete().lt("created_at", oneHourAgo);
    } catch (error) {
      // Silently fail cleanup - not critical
      console.warn("Failed to cleanup expired OTPs:", error);
    }
  }
}
