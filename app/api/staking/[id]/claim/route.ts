import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// POST: Claim rewards for a position
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: positionId } = await params;
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get position
    const { data: position, error: positionError } = await supabase
      .from("staking_positions")
      .select("*")
      .eq("id", positionId)
      .eq("user_email", userEmail)
      .single();

    if (positionError || !position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // Get unclaimed rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("staking_rewards")
      .select("*")
      .eq("position_id", positionId)
      .eq("claimed", false);

    if (rewardsError) {
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      );
    }

    const totalRewards =
      rewards?.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) ||
      0;

    if (totalRewards === 0) {
      return NextResponse.json(
        { error: "No rewards to claim" },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Mark rewards as claimed
    const { error: updateError } = await supabase
      .from("staking_rewards")
      .update({ claimed: true, claimed_at: now })
      .eq("position_id", positionId)
      .eq("claimed", false);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to claim rewards" },
        { status: 500 }
      );
    }

    // Add rewards to user balance
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("kredo_balance")
      .eq("user_email", userEmail)
      .single();

    const currentBalance = parseFloat(
      profile?.kredo_balance?.toString() || "0"
    );
    const newBalance = currentBalance + totalRewards;

    await supabase
      .from("user_profiles")
      .update({ kredo_balance: newBalance, updated_at: now })
      .eq("user_email", userEmail);

    // Update position
    await supabase
      .from("staking_positions")
      .update({ last_reward_claim: now, updated_at: now })
      .eq("id", positionId);

    // Record in history
    await supabase.from("staking_history").insert({
      id: generateId(),
      user_email: userEmail,
      position_id: positionId,
      action: "claim_rewards",
      amount: totalRewards,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      claimed: totalRewards,
      newBalance,
    });
  } catch (error) {
    console.error("POST /api/staking/[id]/claim error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
