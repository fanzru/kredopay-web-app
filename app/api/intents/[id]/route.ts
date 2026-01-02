import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { spendingIntents } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// @ts-ignore
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: intentId } = await params;
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In Edge Runtime, always use Supabase client
    if (!db || !isDatabaseConfigured()) {
      // Check if intent exists and belongs to user
      const { data: intent, error: fetchError } = await supabase
        .from("spending_intents")
        .select("*")
        .eq("id", intentId)
        .eq("user_email", userEmail)
        .single();

      if (fetchError || !intent) {
        return NextResponse.json(
          { error: "Intent not found" },
          { status: 404 }
        );
      }

      // Don't allow deletion of executed intents
      if (intent.status === "executed") {
        return NextResponse.json(
          { error: "Cannot cancel an executed intent" },
          { status: 400 }
        );
      }

      // Delete the intent
      const { error: deleteError } = await supabase
        .from("spending_intents")
        .delete()
        .eq("id", intentId)
        .eq("user_email", userEmail);

      if (deleteError) {
        console.error("Supabase error:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete intent", details: deleteError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Use Drizzle ORM for Node.js runtime
    // Check if intent exists and belongs to user
    const [intent] = await db
      .select()
      .from(spendingIntents)
      .where(
        and(
          eq(spendingIntents.id, intentId),
          eq(spendingIntents.userEmail, userEmail)
        )
      )
      .limit(1);

    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    // Don't allow deletion of executed intents
    if (intent.status === "executed") {
      return NextResponse.json(
        { error: "Cannot cancel an executed intent" },
        { status: 400 }
      );
    }

    // Delete the intent
    await db
      .delete(spendingIntents)
      .where(
        and(
          eq(spendingIntents.id, intentId),
          eq(spendingIntents.userEmail, userEmail)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting intent:", error);

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
        error: "Failed to delete intent",
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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: intentId } = await params;
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { status, proofHash } = body;

    // Validate status
    const validStatuses = [
      "pending_proof",
      "authorized",
      "executed",
      "rejected",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Prepare updates
    const supabaseUpdates: any = {};
    const drizzleUpdates: any = {};

    if (status) {
      supabaseUpdates.status = status;
      drizzleUpdates.status = status;
    }
    if (proofHash) {
      supabaseUpdates.proof_hash = proofHash;
      drizzleUpdates.proofHash = proofHash;
    }
    supabaseUpdates.updated_at = Date.now();
    drizzleUpdates.updatedAt = Date.now();
    if (status === "executed") {
      supabaseUpdates.executed_at = Date.now();
      drizzleUpdates.executedAt = Date.now();
    }

    // In Edge Runtime, always use Supabase client
    if (!db || !isDatabaseConfigured()) {
      // Check if intent exists and belongs to user
      const { data: intent, error: fetchError } = await supabase
        .from("spending_intents")
        .select("*")
        .eq("id", intentId)
        .eq("user_email", userEmail)
        .single();

      if (fetchError || !intent) {
        return NextResponse.json(
          { error: "Intent not found" },
          { status: 404 }
        );
      }

      // Update the intent
      const { data: updatedIntent, error: updateError } = await supabase
        .from("spending_intents")
        .update(supabaseUpdates)
        .eq("id", intentId)
        .eq("user_email", userEmail)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase error:", updateError);
        return NextResponse.json(
          { error: "Failed to update intent", details: updateError.message },
          { status: 500 }
        );
      }

      // Format response
      const formattedIntent = {
        id: updatedIntent.id,
        userEmail: updatedIntent.user_email,
        type: updatedIntent.type,
        description: updatedIntent.description,
        amount: updatedIntent.amount,
        currency: updatedIntent.currency,
        status: updatedIntent.status,
        merchant: updatedIntent.merchant,
        category: updatedIntent.category,
        createdAt: new Date(Number(updatedIntent.created_at)),
        updatedAt: updatedIntent.updated_at
          ? new Date(Number(updatedIntent.updated_at))
          : null,
        proofHash: updatedIntent.proof_hash,
        executedAt: updatedIntent.executed_at
          ? new Date(Number(updatedIntent.executed_at))
          : null,
      };

      return NextResponse.json({ intent: formattedIntent });
    }

    // Use Drizzle ORM for Node.js runtime
    // Check if intent exists and belongs to user
    const [intent] = await db
      .select()
      .from(spendingIntents)
      .where(
        and(
          eq(spendingIntents.id, intentId),
          eq(spendingIntents.userEmail, userEmail)
        )
      )
      .limit(1);

    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    // Update the intent
    const [updatedIntent] = await db
      .update(spendingIntents)
      .set(drizzleUpdates)
      .where(
        and(
          eq(spendingIntents.id, intentId),
          eq(spendingIntents.userEmail, userEmail)
        )
      )
      .returning();

    // Format response
    const formattedIntent = {
      ...updatedIntent,
      createdAt: new Date(Number(updatedIntent.createdAt)),
      updatedAt: updatedIntent.updatedAt
        ? new Date(Number(updatedIntent.updatedAt))
        : null,
      executedAt: updatedIntent.executedAt
        ? new Date(Number(updatedIntent.executedAt))
        : null,
    };

    return NextResponse.json({ intent: formattedIntent });
  } catch (error) {
    console.error("Error updating intent:", error);

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
        error: "Failed to update intent",
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
