import { NextRequest, NextResponse } from "next/server";
import { OTPDatabase } from "@/lib/db-otp";
import { sendOTPEmail } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

/**
 * Generate a 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/send-otp
 * Send OTP code to user's email
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using dev mode");
      // In dev mode without database, just return success
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully (dev mode - no database)",
        isDev: true,
      });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if this is the dev bypass email
    const devEmail =
      process.env.DEV_EMAIL ||
      process.env.NEXT_PUBLIC_DEV_EMAIL ||
      "dev@kredopay.app";
    const devOTP =
      process.env.DEV_OTP || process.env.NEXT_PUBLIC_DEV_OTP || "000000";

    if (email.toLowerCase() === devEmail.toLowerCase()) {
      // For dev email, store the hardcoded OTP
      await OTPDatabase.createOTP(email, devOTP);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        isDev: true,
      });
    }

    // Generate OTP for regular users
    const otpCode = generateOTP();

    // Store OTP in database
    await OTPDatabase.createOTP(email, otpCode);

    // Send OTP via email
    const emailResult = await sendOTPEmail({ email, otpCode });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send OTP email", details: emailResult.error },
        { status: 500 }
      );
    }

    // Clean up old OTPs periodically
    await OTPDatabase.cleanupExpiredOTPs();

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    // If database error, provide more helpful message
    if (
      error instanceof Error &&
      (error.message.includes("Failed") || error.message.includes("relation"))
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check Supabase configuration in .env.local",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
