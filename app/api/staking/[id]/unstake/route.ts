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

// POST: Unstake position
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

    if (position.status !== "active") {
      return NextResponse.json(
        { error: "Position is not active" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const amount = parseFloat(position.amount.toString());
    let returnAmount = amount;
    let penalty = 0;

    // Check if locked and apply penalty if early unstake
    if (position.unlock_at && now < position.unlock_at) {
      penalty = amount * 0.1; // 10% penalty
      returnAmount = amount - penalty;
    }

    // Auto-claim any unclaimed rewards
    const { data: rewards } = await supabase
      .from("staking_rewards")
      .select("*")
      .eq("position_id", positionId)
      .eq("claimed", false);

    const totalRewards =
      rewards?.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) ||
      0;

    if (totalRewards > 0) {
      await supabase
        .from("staking_rewards")
        .update({ claimed: true, claimed_at: now })
        .eq("position_id", positionId)
        .eq("claimed", false);
    }

    // Get user balance
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("kredo_balance")
      .eq("user_email", userEmail)
      .single();

    const currentBalance = parseFloat(
      profile?.kredo_balance?.toString() || "0"
    );
    const newBalance = currentBalance + returnAmount + totalRewards;

    // Update user balance
    await supabase
      .from("user_profiles")
      .update({ kredo_balance: newBalance, updated_at: now })
      .eq("user_email", userEmail);

    // Update position status
    await supabase
      .from("staking_positions")
      .update({ status: "completed", updated_at: now })
      .eq("id", positionId);

    // Record in history
    await supabase.from("staking_history").insert({
      id: generateId(),
      user_email: userEmail,
      position_id: positionId,
      action: "unstake",
      amount: returnAmount,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      returned: returnAmount,
      rewards: totalRewards,
      penalty,
      newBalance,
    });
  } catch (error) {
    console.error("POST /api/staking/[id]/unstake error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
