import { NextRequest, NextResponse } from "next/server";
import { OTPDatabase } from "@/lib/db-otp";
import { sendOTPEmail } from "@/lib/email";

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
    // Support both DEV_EMAIL and NEXT_PUBLIC_DEV_EMAIL for flexibility
    const devEmail =
      process.env.DEV_EMAIL ||
      process.env.NEXT_PUBLIC_DEV_EMAIL ||
      "dev@kredopay.app";
    const devOTP =
      process.env.DEV_OTP || process.env.NEXT_PUBLIC_DEV_OTP || "000000";

    if (email.toLowerCase() === devEmail.toLowerCase()) {
      // For dev email, store the hardcoded OTP
      OTPDatabase.createOTP(email, devOTP);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        isDev: true,
      });
    }

    // Generate OTP for regular users
    const otpCode = generateOTP();

    // Store OTP in database
    OTPDatabase.createOTP(email, otpCode);

    // Send OTP via email
    const emailResult = await sendOTPEmail({ email, otpCode });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send OTP email", details: emailResult.error },
        { status: 500 }
      );
    }

    // Clean up old OTPs periodically
    OTPDatabase.cleanupExpiredOTPs();

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
