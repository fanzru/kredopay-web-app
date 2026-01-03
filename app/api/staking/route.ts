import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STAKING_TIERS = {
  BRONZE: { name: "Bronze", minStake: 100, apr: 5 },
  SILVER: { name: "Silver", minStake: 1000, apr: 10 },
  GOLD: { name: "Gold", minStake: 10000, apr: 15 },
  PLATINUM: { name: "Platinum", minStake: 100000, apr: 25 },
};

const LOCK_BONUSES: Record<number, number> = {
  0: 0,
  30: 2,
  90: 5,
  180: 10,
  365: 20,
};

function calculateTier(amount: number): string {
  if (amount >= STAKING_TIERS.PLATINUM.minStake) return "PLATINUM";
  if (amount >= STAKING_TIERS.GOLD.minStake) return "GOLD";
  if (amount >= STAKING_TIERS.SILVER.minStake) return "SILVER";
  return "BRONZE";
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET: Fetch user's staking data
export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with wallet
    let { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_email", userEmail)
      .single();

    // Auto-create profile if not exists
    if (profileError && profileError.code === "PGRST116") {
      const now = Date.now();
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_email: userEmail,
          wallet_address: null,
          kredo_balance: 0, // Deprecated, will use card balance
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

      profile = newProfile;
    } else if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Calculate total balance from virtual cards
    const { data: cards, error: cardsError } = await supabase
      .from("virtual_cards")
      .select("balance")
      .eq("user_email", userEmail)
      .eq("status", "active");

    if (cardsError) {
      console.error("Cards error:", cardsError);
    }

    const totalCardBalance =
      cards?.reduce(
        (sum, card) => sum + parseFloat(card.balance?.toString() || "0"),
        0
      ) || 0;

    // Get staking positions
    const { data: positions, error: positionsError } = await supabase
      .from("staking_positions")
      .select("*")
      .eq("user_email", userEmail)
      .eq("status", "active");

    if (positionsError) {
      console.error("Positions error:", positionsError);
      return NextResponse.json(
        { error: "Failed to fetch positions" },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalStaked =
      positions?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) ||
      0;
    const totalRewards =
      positions?.reduce(
        (sum, p) => sum + parseFloat(p.total_rewards_earned.toString()),
        0
      ) || 0;

    // Determine current tier based on total staked
    const currentTier = totalStaked > 0 ? calculateTier(totalStaked) : "BRONZE";

    return NextResponse.json({
      profile: {
        ...profile,
        kredo_balance: totalCardBalance, // Use card balance instead
      },
      positions: positions || [],
      totalStaked,
      totalRewards,
      currentTier,
    });
  } catch (error) {
    console.error("GET /api/staking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new staking position
export async function POST(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, lockPeriodDays } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_email", userEmail)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get total balance from virtual cards
    const { data: cards } = await supabase
      .from("virtual_cards")
      .select("balance")
      .eq("user_email", userEmail)
      .eq("status", "active");

    const totalCardBalance =
      cards?.reduce(
        (sum, card) => sum + parseFloat(card.balance?.toString() || "0"),
        0
      ) || 0;

    // Get total already staked
    const { data: existingPositions } = await supabase
      .from("staking_positions")
      .select("amount")
      .eq("user_email", userEmail)
      .eq("status", "active");

    const totalStaked =
      existingPositions?.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      ) || 0;
    const availableBalance = totalCardBalance - totalStaked;

    // Check if user has enough balance
    if (availableBalance < amount) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: amount,
          available: availableBalance,
          totalCardBalance,
          alreadyStaked: totalStaked,
        },
        { status: 400 }
      );
    }

    // Calculate tier and APR
    const tier = calculateTier(amount);
    const baseAPR = STAKING_TIERS[tier as keyof typeof STAKING_TIERS].apr;
    const lockBonus = LOCK_BONUSES[lockPeriodDays] || 0;
    const finalAPR = baseAPR + lockBonus;

    const now = Date.now();
    const unlockAt =
      lockPeriodDays > 0 ? now + lockPeriodDays * 24 * 60 * 60 * 1000 : null;

    // Create staking position
    const position = {
      id: generateId(),
      user_email: userEmail,
      amount,
      tier,
      apr: finalAPR,
      staked_at: now,
      unlock_at: unlockAt,
      lock_period_days: lockPeriodDays,
      status: "active",
      total_rewards_earned: 0,
      created_at: now,
      updated_at: now,
    };

    const { data: newPosition, error: positionError } = await supabase
      .from("staking_positions")
      .insert(position)
      .select()
      .single();

    if (positionError) {
      console.error("Position creation error:", positionError);
      return NextResponse.json(
        { error: "Failed to create position" },
        { status: 500 }
      );
    }

    // NOTE: We don't deduct from user_profiles.kredo_balance anymore
    // Balance is tracked via virtual_cards, and staking_positions tracks locked amounts

    // Record in history
    await supabase.from("staking_history").insert({
      id: generateId(),
      user_email: userEmail,
      position_id: position.id,
      action: "stake",
      amount,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      position: newPosition,
      availableBalance: availableBalance - amount,
    });
  } catch (error) {
    console.error("POST /api/staking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
