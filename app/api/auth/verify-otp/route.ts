import { NextRequest, NextResponse } from "next/server";
import { OTPDatabase } from "@/lib/db-otp";
import { sign } from "jsonwebtoken";

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Verify OTP from database
    const isValid = OTPDatabase.verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "kredo_dev_secret_key_2026";
    const token = sign(
      {
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      jwtSecret
    );

    return NextResponse.json({
      success: true,
      token,
      email, // Include email in response
      user: {
        email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
