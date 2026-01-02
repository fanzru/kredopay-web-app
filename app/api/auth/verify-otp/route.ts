import { NextRequest, NextResponse } from "next/server";
import { OTPDatabase } from "@/lib/db-otp";
import { SignJWT } from "jose";
import { isSupabaseConfigured } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured, using dev mode");
      // In dev mode, accept any OTP for dev email
      const devEmail =
        process.env.DEV_EMAIL ||
        process.env.NEXT_PUBLIC_DEV_EMAIL ||
        "dev@kredopay.app";
      const devOTP =
        process.env.DEV_OTP || process.env.NEXT_PUBLIC_DEV_OTP || "000000";

      const body = await request.json();
      const { email, otp } = body;

      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      if (!otp || typeof otp !== "string") {
        return NextResponse.json({ error: "OTP is required" }, { status: 400 });
      }

      // In dev mode, only accept dev email + dev OTP
      if (email.toLowerCase() === devEmail.toLowerCase() && otp === devOTP) {
        const jwtSecret = process.env.JWT_SECRET || "kredo_dev_secret_key_2026";
        const secret = new TextEncoder().encode(jwtSecret);
        const token = await new SignJWT({ email })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30d")
          .sign(secret);

        return NextResponse.json({
          success: true,
          token,
          email,
          user: { email },
          isDev: true,
        });
      }

      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, otp } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Verify OTP from database
    const isValid = await OTPDatabase.verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "kredo_dev_secret_key_2026";
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

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
