import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// Generate unique 4-digit decimal code (1000-9999)
function generateDecimalCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Calculate exact amount with unique decimal code
function calculateExactAmount(requestedAmount: number): {
  exactAmount: number;
  decimalCode: string;
} {
  const decimalCode = generateDecimalCode();
  const exactAmount = parseFloat(
    (requestedAmount + parseFloat(`0.${decimalCode}`)).toFixed(4)
  );
  return { exactAmount, decimalCode };
}

// Get Kredo Solana wallet address from environment
function getKredoSolanaWallet(): string {
  return (
    process.env.KREDO_SOLANA_WALLET_ADDRESS || "SOLANA_WALLET_NOT_CONFIGURED" // Placeholder
  );
}

// POST - Create new internal top-up request
export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      userWalletAddress,
      cardId,
      method = "wallet_address",
    } = body;

    // Validation
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: "Minimum top-up amount is $1" },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: "Maximum top-up amount is $100,000" },
        { status: 400 }
      );
    }

    if (!userWalletAddress || typeof userWalletAddress !== "string") {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    // Basic wallet address validation
    if (userWalletAddress.length < 10) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Generate unique ID and exact amount
    const topupId = `ITOP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const createdAt = Date.now();
    const { exactAmount, decimalCode } = calculateExactAmount(amount);
    const solanaWallet = getKredoSolanaWallet();

    try {
      // Insert into database
      const { data: topupRequest, error } = await supabase
        .from("internal_topup_requests")
        .insert({
          id: topupId,
          user_email: userEmail,
          requested_amount: amount.toString(),
          exact_amount: exactAmount.toFixed(4),
          decimal_code: decimalCode,
          currency: "USDC",
          user_wallet_address: userWalletAddress,
          solana_wallet_address: solanaWallet,
          topup_method: method,
          status: "pending",
          card_id: cardId || null,
          created_at: createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to create top-up request", details: error.message },
          { status: 500 }
        );
      }

      // Format response
      const formattedTopup = {
        id: topupRequest.id,
        userEmail: topupRequest.user_email,
        requestedAmount: topupRequest.requested_amount,
        exactAmount: topupRequest.exact_amount,
        decimalCode: topupRequest.decimal_code,
        currency: topupRequest.currency,
        userWalletAddress: topupRequest.user_wallet_address,
        solanaWalletAddress: topupRequest.solana_wallet_address,
        topupMethod: topupRequest.topup_method,
        status: topupRequest.status,
        cardId: topupRequest.card_id,
        createdAt: topupRequest.created_at,
      };

      return NextResponse.json({ topup: formattedTopup }, { status: 201 });
    } catch (err) {
      console.error("Supabase insert error:", err);
      return NextResponse.json(
        {
          error: "Failed to create top-up request",
          details: err instanceof Error ? err.message : "Database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating internal top-up:", error);
    return NextResponse.json(
      {
        error: "Failed to create top-up request",
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

// GET - List all internal top-up requests for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { data: topups, error } = await supabase
        .from("internal_topup_requests")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ topups: [] });
      }

      // Format response
      const formattedTopups = (topups || []).map((topup: any) => ({
        id: topup.id,
        userEmail: topup.user_email,
        requestedAmount: topup.requested_amount,
        exactAmount: topup.exact_amount,
        decimalCode: topup.decimal_code,
        currency: topup.currency,
        userWalletAddress: topup.user_wallet_address,
        solanaWalletAddress: topup.solana_wallet_address,
        topupMethod: topup.topup_method,
        status: topup.status,
        cardId: topup.card_id,
        createdAt: topup.created_at,
        approvedAt: topup.approved_at,
        approvedBy: topup.approved_by,
        completedAt: topup.completed_at,
        rejectedAt: topup.rejected_at,
        rejectionReason: topup.rejection_reason,
      }));

      return NextResponse.json({ topups: formattedTopups });
    } catch (err) {
      console.error("Supabase query error:", err);
      return NextResponse.json({ topups: [] });
    }
  } catch (error) {
    console.error("Error fetching internal top-ups:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch top-ups",
        topups: [],
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
