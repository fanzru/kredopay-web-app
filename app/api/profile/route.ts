import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Create or update user profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, walletAddress, kredoBalance } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const now = Date.now();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_email", email)
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          wallet_address: walletAddress || existing.wallet_address,
          kredo_balance:
            kredoBalance !== undefined ? kredoBalance : existing.kredo_balance,
          updated_at: now,
        })
        .eq("user_email", email)
        .select()
        .single();

      if (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, profile: data });
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_email: email,
          wallet_address: walletAddress || null,
          kredo_balance: kredoBalance || 0,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error("Profile creation error:", error);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, profile: data });
    }
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get user profile
export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_email", userEmail)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Profile fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!data) {
      // Create default profile if not exists
      const now = Date.now();
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_email: userEmail,
          wallet_address: null,
          kredo_balance: 0,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (createError) {
        console.error("Profile creation error:", createError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
