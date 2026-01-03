import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// PATCH - Verify/Complete deposit (typically called by webhook or admin)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const depositId = params.id;
    const body = await request.json();
    const { status, transactionHash } = body;

    // Validate status
    const validStatuses = ["pending", "completed", "failed", "expired"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Prepare updates
    const supabaseUpdates: any = {};

    if (status !== undefined) {
      supabaseUpdates.status = status;
    }
    if (transactionHash !== undefined) {
      supabaseUpdates.transaction_hash = transactionHash;
    }
    if (status === "completed") {
      supabaseUpdates.completed_at = Date.now();
    }

    if (Object.keys(supabaseUpdates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Verify deposit belongs to user and update
    const { data: deposit, error: fetchError } = await supabase
      .from("deposit_requests")
      .select("*")
      .eq("id", depositId)
      .eq("user_email", userEmail)
      .single();

    if (fetchError || !deposit) {
      return NextResponse.json(
        { error: "Deposit request not found" },
        { status: 404 }
      );
    }

    // If completing deposit, update card balance
    if (status === "completed" && deposit.status === "pending") {
      // Use requested_amount (the amount user wanted to deposit), not exact_amount
      const amount = parseFloat(deposit.requested_amount || deposit.amount);

      // If cardId is specified, update that card's balance
      if (deposit.card_id) {
        const { data: card, error: cardError } = await supabase
          .from("virtual_cards")
          .select("balance")
          .eq("id", deposit.card_id)
          .eq("user_email", userEmail)
          .single();

        if (card && !cardError) {
          const currentBalance = parseFloat(card.balance || "0");
          const newBalance = (currentBalance + amount).toString();

          await supabase
            .from("virtual_cards")
            .update({ balance: newBalance, last_used: Date.now() })
            .eq("id", deposit.card_id)
            .eq("user_email", userEmail);

          // Create transaction record
          const transactionId = `tx-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
          await supabase.from("transactions").insert({
            id: transactionId,
            card_id: deposit.card_id,
            user_email: userEmail,
            type: "topup",
            amount: amount.toString(),
            merchant: "Kredo Deposit",
            timestamp: Date.now(),
            status: "completed",
          });
        }
      } else {
        // If no card specified, update the first active card or create a default transaction
        const { data: cards } = await supabase
          .from("virtual_cards")
          .select("id, balance")
          .eq("user_email", userEmail)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (cards) {
          const currentBalance = parseFloat(cards.balance || "0");
          const newBalance = (currentBalance + amount).toString();

          await supabase
            .from("virtual_cards")
            .update({ balance: newBalance, last_used: Date.now() })
            .eq("id", cards.id)
            .eq("user_email", userEmail);

          // Create transaction record
          const transactionId = `tx-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
          await supabase.from("transactions").insert({
            id: transactionId,
            card_id: cards.id,
            user_email: userEmail,
            type: "topup",
            amount: amount.toString(),
            merchant: "Kredo Deposit",
            timestamp: Date.now(),
            status: "completed",
          });
        }
      }
    }

    // Update deposit request
    const { data: updatedDeposit, error: updateError } = await supabase
      .from("deposit_requests")
      .update(supabaseUpdates)
      .eq("id", depositId)
      .eq("user_email", userEmail)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return NextResponse.json(
        { error: "Failed to update deposit", details: updateError.message },
        { status: 500 }
      );
    }

    // Map Supabase response to match schema format
    const formattedDeposit = {
      id: updatedDeposit.id,
      userEmail: updatedDeposit.user_email,
      requestedAmount: updatedDeposit.requested_amount || updatedDeposit.amount,
      exactAmount: updatedDeposit.exact_amount || updatedDeposit.amount,
      amount: updatedDeposit.exact_amount || updatedDeposit.amount, // For backward compatibility
      currency: updatedDeposit.currency,
      uniqueCode: updatedDeposit.unique_code,
      walletAddress: updatedDeposit.wallet_address,
      status: updatedDeposit.status,
      cardId: updatedDeposit.card_id,
      createdAt: updatedDeposit.created_at,
      expiresAt: updatedDeposit.expires_at,
      completedAt: updatedDeposit.completed_at,
      transactionHash: updatedDeposit.transaction_hash,
    };

    return NextResponse.json({ deposit: formattedDeposit });
  } catch (error) {
    console.error("Error updating deposit:", error);
    return NextResponse.json(
      {
        error: "Failed to update deposit",
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

// GET - Get single deposit request
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const depositId = params.id;

    const { data: deposit, error } = await supabase
      .from("deposit_requests")
      .select("*")
      .eq("id", depositId)
      .eq("user_email", userEmail)
      .single();

    if (error || !deposit) {
      return NextResponse.json(
        { error: "Deposit request not found" },
        { status: 404 }
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
    };

    return NextResponse.json({ deposit: formattedDeposit });
  } catch (error) {
    console.error("Error fetching deposit:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch deposit",
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
