import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// PATCH - Submit transaction hash for internal top-up
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const topupId = params.id;
    const body = await request.json();
    const { transactionHash } = body;

    if (!transactionHash || typeof transactionHash !== "string") {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    // Basic validation for Solana transaction hash
    if (transactionHash.length < 20) {
      return NextResponse.json(
        { error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }

    try {
      // Get the topup request
      const { data: topup, error: fetchError } = await supabase
        .from("internal_topup_requests")
        .select("*")
        .eq("id", topupId)
        .eq("user_email", userEmail)
        .single();

      if (fetchError || !topup) {
        return NextResponse.json(
          { error: "Top-up request not found" },
          { status: 404 }
        );
      }

      // Check if already has transaction hash
      if (topup.transaction_hash) {
        return NextResponse.json(
          { error: "Transaction hash already submitted" },
          { status: 400 }
        );
      }

      // Check if status is pending
      if (topup.status !== "pending") {
        return NextResponse.json(
          {
            error: `Cannot submit transaction hash for ${topup.status} request`,
          },
          { status: 400 }
        );
      }

      // Update with transaction hash and change status to verifying
      const { data: updated, error: updateError } = await supabase
        .from("internal_topup_requests")
        .update({
          transaction_hash: transactionHash,
          status: "verifying",
        })
        .eq("id", topupId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating topup:", updateError);
        return NextResponse.json(
          { error: "Failed to submit transaction hash" },
          { status: 500 }
        );
      }

      // Format response
      const formattedTopup = {
        id: updated.id,
        userEmail: updated.user_email,
        requestedAmount: updated.requested_amount,
        exactAmount: updated.exact_amount,
        decimalCode: updated.decimal_code,
        currency: updated.currency,
        userWalletAddress: updated.user_wallet_address,
        solanaWalletAddress: updated.solana_wallet_address,
        topupMethod: updated.topup_method,
        status: updated.status,
        cardId: updated.card_id,
        createdAt: updated.created_at,
        transactionHash: updated.transaction_hash,
      };

      return NextResponse.json({ topup: formattedTopup });
    } catch (err) {
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to submit transaction hash" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error submitting transaction hash:", error);
    return NextResponse.json(
      {
        error: "Failed to submit transaction hash",
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
