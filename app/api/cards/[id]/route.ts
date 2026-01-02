import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// @ts-ignore
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

    const cardId = params.id;
    const body = await request.json();

    // Prepare updates
    const supabaseUpdates: any = {};

    if (body.name !== undefined) {
      supabaseUpdates.name = body.name.trim();
    }
    if (body.status !== undefined) {
      supabaseUpdates.status = body.status;
    }
    if (body.spendingLimit !== undefined) {
      supabaseUpdates.spending_limit = body.spendingLimit.toString();
    }
    if (body.balance !== undefined) {
      supabaseUpdates.balance = body.balance.toString();
    }
    if (body.lastUsed !== undefined) {
      supabaseUpdates.last_used = body.lastUsed;
    }

    if (Object.keys(supabaseUpdates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Edge Runtime: Always use Supabase client (postgres client not compatible)
    // Since we're using export const runtime = "edge", we MUST use Supabase
    // Verify card belongs to user and update using Supabase
    const { data: card, error: fetchError } = await supabase
      .from("virtual_cards")
      .select("*")
      .eq("id", cardId)
      .eq("user_email", userEmail)
      .single();

    if (fetchError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const { data: updatedCard, error: updateError } = await supabase
      .from("virtual_cards")
      .update(supabaseUpdates)
      .eq("id", cardId)
      .eq("user_email", userEmail)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return NextResponse.json(
        { error: "Failed to update card", details: updateError.message },
        { status: 500 }
      );
    }

    // Map Supabase response to match Drizzle schema format
    // Ensure status is lowercase and valid
    const cardStatus = (updatedCard.status || "active").toLowerCase();
    const validStatus = ["active", "frozen", "expired"].includes(cardStatus)
      ? cardStatus
      : "active";

    const formattedCard = {
      id: updatedCard.id,
      cardNumber: updatedCard.card_number,
      expiryDate: updatedCard.expiry_date,
      cvv: updatedCard.cvv,
      balance: updatedCard.balance,
      currency: updatedCard.currency,
      status: validStatus,
      spendingLimit: updatedCard.spending_limit,
      createdAt: updatedCard.created_at,
      lastUsed: updatedCard.last_used,
      userEmail: updatedCard.user_email,
      name: updatedCard.name,
    };

    return NextResponse.json({ card: formattedCard });
  } catch (error) {
    console.error("Error updating card:", error);

    if (error instanceof Error && error.message.includes("Failed query")) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check DATABASE_URL in .env.local",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update card",
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

// @ts-ignore
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cardId = params.id;

    // Edge Runtime: Always use Supabase client (postgres client not compatible)
    // Since we're using export const runtime = "edge", we MUST use Supabase
    // Verify card belongs to user
    const { data: card, error: fetchError } = await supabase
      .from("virtual_cards")
      .select("*")
      .eq("id", cardId)
      .eq("user_email", userEmail)
      .single();

    if (fetchError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete card (transactions will be cascade deleted)
    const { error: deleteError } = await supabase
      .from("virtual_cards")
      .delete()
      .eq("id", cardId)
      .eq("user_email", userEmail);

    if (deleteError) {
      console.error("Supabase error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete card", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);

    if (error instanceof Error && error.message.includes("Failed query")) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check DATABASE_URL in .env.local",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete card",
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
