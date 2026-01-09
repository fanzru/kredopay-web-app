import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Verify admin API key
function verifyAdminApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-admin-api-key");
  const validApiKey = process.env.ADMIN_API_KEY;

  if (!validApiKey) {
    console.error("ADMIN_API_KEY not configured in environment");
    return false;
  }

  return apiKey === validApiKey;
}

// POST - Issue/Approve internal top-up (Admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API key
    if (!verifyAdminApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const topupId = params.id;
    const body = await request.json();
    const { transactionHash, adminNotes } = body;

    // Get the topup request
    const { data: topupRequest, error: fetchError } = await supabase
      .from("internal_topup_requests")
      .select("*")
      .eq("id", topupId)
      .single();

    if (fetchError || !topupRequest) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (
      topupRequest.status !== "pending" &&
      topupRequest.status !== "verifying"
    ) {
      return NextResponse.json(
        {
          error: `Top-up request already ${topupRequest.status}`,
          currentStatus: topupRequest.status,
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    const requestedAmount = parseFloat(topupRequest.requested_amount);

    // Step 1: Approve the request
    const { error: approveError } = await supabase
      .from("internal_topup_requests")
      .update({
        status: "approved",
        approved_at: now,
        approved_by: "admin_api",
        admin_notes:
          adminNotes || `Approved via API - TX: ${transactionHash || "N/A"}`,
        transaction_hash: transactionHash || null,
      })
      .eq("id", topupId);

    if (approveError) {
      console.error("Error approving topup:", approveError);
      return NextResponse.json(
        { error: "Failed to approve top-up request" },
        { status: 500 }
      );
    }

    // Step 2: Update card balance (if cardId exists)
    if (topupRequest.card_id) {
      const { data: card, error: cardFetchError } = await supabase
        .from("virtual_cards")
        .select("balance")
        .eq("id", topupRequest.card_id)
        .single();

      if (cardFetchError || !card) {
        console.error("Card not found:", cardFetchError);
        return NextResponse.json(
          { error: "Card not found for this top-up request" },
          { status: 404 }
        );
      }

      const currentBalance = parseFloat(card.balance || "0");
      const newBalance = currentBalance + requestedAmount;

      const { error: balanceError } = await supabase
        .from("virtual_cards")
        .update({
          balance: newBalance.toFixed(2),
          last_used: now,
        })
        .eq("id", topupRequest.card_id);

      if (balanceError) {
        console.error("Error updating card balance:", balanceError);
        return NextResponse.json(
          { error: "Failed to update card balance" },
          { status: 500 }
        );
      }

      // Step 3: Create transaction record
      const transactionId = `tx-${now}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      const { error: txError } = await supabase.from("transactions").insert({
        id: transactionId,
        card_id: topupRequest.card_id,
        user_email: topupRequest.user_email,
        type: "topup_internal",
        amount: requestedAmount.toFixed(2),
        merchant: "Internal Top-Up (Solana)",
        timestamp: now,
        status: "completed",
      });

      if (txError) {
        console.error("Error creating transaction:", txError);
        // Continue anyway, balance is already updated
      }
    }

    // Step 4: Mark topup as completed
    const { error: completeError } = await supabase
      .from("internal_topup_requests")
      .update({
        status: "completed",
        completed_at: now,
      })
      .eq("id", topupId);

    if (completeError) {
      console.error("Error marking topup as completed:", completeError);
      return NextResponse.json(
        { error: "Failed to mark top-up as completed" },
        { status: 500 }
      );
    }

    // Fetch updated topup request
    const { data: updatedTopup } = await supabase
      .from("internal_topup_requests")
      .select("*")
      .eq("id", topupId)
      .single();

    return NextResponse.json({
      success: true,
      message: "Top-up issued successfully",
      topup: {
        id: updatedTopup.id,
        userEmail: updatedTopup.user_email,
        requestedAmount: updatedTopup.requested_amount,
        exactAmount: updatedTopup.exact_amount,
        status: updatedTopup.status,
        approvedAt: updatedTopup.approved_at,
        completedAt: updatedTopup.completed_at,
        transactionHash: updatedTopup.transaction_hash,
      },
    });
  } catch (error) {
    console.error("Error issuing top-up:", error);
    return NextResponse.json(
      {
        error: "Failed to issue top-up",
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

// GET - Get specific top-up request (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API key
    if (!verifyAdminApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const topupId = params.id;

    const { data: topup, error } = await supabase
      .from("internal_topup_requests")
      .select("*")
      .eq("id", topupId)
      .single();

    if (error || !topup) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedTopup = {
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
      adminNotes: topup.admin_notes,
      transactionHash: topup.transaction_hash,
    };

    return NextResponse.json({ topup: formattedTopup });
  } catch (error) {
    console.error("Error fetching top-up:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up request" },
      { status: 500 }
    );
  }
}
