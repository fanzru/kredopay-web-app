import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// Generate unique deposit code (format: DEP-XXXX-XXXX-XXXX)
function generateUniqueCode(): string {
  const parts = [];
  for (let i = 0; i < 3; i++) {
    parts.push(Math.floor(1000 + Math.random() * 9000).toString());
  }
  return `DEP-${parts.join("-")}`;
}

// Generate unique 3-digit decimal code (000-999)
function generateUniqueDecimalCode(): string {
  return Math.floor(100 + Math.random() * 900)
    .toString()
    .padStart(3, "0");
}

// Calculate exact amount with unique decimal code
function calculateExactAmount(requestedAmount: number): {
  exactAmount: number;
  decimalCode: string;
} {
  const decimalCode = generateUniqueDecimalCode();
  const exactAmount = parseFloat(
    (requestedAmount + parseFloat(`0.${decimalCode}`)).toFixed(3)
  );
  return { exactAmount, decimalCode };
}

// Get Kredo wallet address from environment (or use a default for now)
function getKredoWalletAddress(): string {
  return (
    process.env.KREDO_WALLET_ADDRESS ||
    "0x0000000000000000000000000000000000000000" // Placeholder - replace with actual address
  );
}

// GET - List all deposit requests for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { data: deposits, error } = await supabase
        .from("deposit_requests")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ deposits: [] });
      }

      // Map Supabase response to match schema format
      const formattedDeposits = (deposits || []).map((deposit: any) => ({
        id: deposit.id,
        userEmail: deposit.user_email,
        requestedAmount: deposit.requested_amount || deposit.amount, // Fallback for old records
        exactAmount: deposit.exact_amount || deposit.amount, // Fallback for old records
        amount: deposit.exact_amount || deposit.amount, // For backward compatibility
        currency: deposit.currency,
        uniqueCode: deposit.unique_code,
        walletAddress: deposit.wallet_address,
        status: deposit.status,
        cardId: deposit.card_id,
        createdAt: deposit.created_at,
        expiresAt: deposit.expires_at,
        completedAt: deposit.completed_at,
        transactionHash: deposit.transaction_hash,
      }));

      return NextResponse.json({ deposits: formattedDeposits });
    } catch (err) {
      console.error("Supabase query error:", err);
      return NextResponse.json({ deposits: [] });
    }
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch deposits",
        deposits: [],
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

// POST - Create new deposit request
export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, cardId, currency = "USDC" } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Minimum amount check
    if (amount < 1) {
      return NextResponse.json(
        { error: "Minimum deposit amount is $1" },
        { status: 400 }
      );
    }

    // Maximum amount check (optional safety limit)
    if (amount > 100000) {
      return NextResponse.json(
        { error: "Maximum deposit amount is $100,000" },
        { status: 400 }
      );
    }

    // Generate unique deposit code and exact amount with decimal code
    const uniqueCode = generateUniqueCode();
    const { exactAmount, decimalCode } = calculateExactAmount(amount);
    const depositId = `deposit-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const createdAt = Date.now();
    const expiresAt = createdAt + 24 * 60 * 60 * 1000; // 24 hours expiry
    const walletAddress = getKredoWalletAddress();

    try {
      const { data: deposit, error } = await supabase
        .from("deposit_requests")
        .insert({
          id: depositId,
          user_email: userEmail,
          requested_amount: amount.toString(),
          exact_amount: exactAmount.toFixed(3),
          currency: currency,
          unique_code: uniqueCode,
          wallet_address: walletAddress,
          status: "pending",
          card_id: cardId || null,
          created_at: createdAt,
          expires_at: expiresAt,
          completed_at: null,
          transaction_hash: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to create deposit request", details: error.message },
          { status: 500 }
        );
      }

      // Map Supabase response to match schema format
      const formattedDeposit = {
        id: deposit.id,
        userEmail: deposit.user_email,
        requestedAmount: deposit.requested_amount || deposit.amount,
        exactAmount: deposit.exact_amount || deposit.amount,
        amount: deposit.exact_amount || deposit.amount, // For backward compatibility
        currency: deposit.currency,
        uniqueCode: deposit.unique_code,
        walletAddress: deposit.wallet_address,
        status: deposit.status,
        cardId: deposit.card_id,
        createdAt: deposit.created_at,
        expiresAt: deposit.expires_at,
        completedAt: deposit.completed_at,
        transactionHash: deposit.transaction_hash,
        decimalCode: decimalCode, // Include the decimal code in response
      };

      return NextResponse.json({ deposit: formattedDeposit }, { status: 201 });
    } catch (err) {
      console.error("Supabase insert error:", err);
      return NextResponse.json(
        {
          error: "Failed to create deposit request",
          details:
            err instanceof Error ? err.message : "Request timeout or error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating deposit:", error);
    return NextResponse.json(
      {
        error: "Failed to create deposit request",
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
