import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { spendingIntents } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// GET - List all spending intents for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In Edge Runtime, always use Supabase client
    if (!db || !isDatabaseConfigured()) {
      const { data: intents, error } = await supabase
        .from("spending_intents")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ intents: [] });
      }

      // Map Supabase response and convert timestamps to Date objects
      const formattedIntents = (intents || []).map((intent: any) => ({
        id: intent.id,
        userEmail: intent.user_email,
        type: intent.type,
        description: intent.description,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        merchant: intent.merchant,
        category: intent.category,
        createdAt: new Date(Number(intent.created_at)),
        updatedAt: intent.updated_at
          ? new Date(Number(intent.updated_at))
          : null,
        proofHash: intent.proof_hash,
        executedAt: intent.executed_at
          ? new Date(Number(intent.executed_at))
          : null,
      }));

      return NextResponse.json({ intents: formattedIntents });
    }

    // Use Drizzle ORM for Node.js runtime
    const intents = await db
      .select()
      .from(spendingIntents)
      .where(eq(spendingIntents.userEmail, userEmail))
      .orderBy(desc(spendingIntents.createdAt));

    // Convert timestamps to Date objects for consistency
    const formattedIntents = intents.map((intent) => ({
      ...intent,
      createdAt: new Date(Number(intent.createdAt)),
      updatedAt: intent.updatedAt ? new Date(Number(intent.updatedAt)) : null,
      executedAt: intent.executedAt
        ? new Date(Number(intent.executedAt))
        : null,
    }));

    return NextResponse.json({ intents: formattedIntents });
  } catch (error) {
    console.error("Error fetching intents:", error);

    if (error instanceof Error && error.message.includes("Failed query")) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check DATABASE_URL in .env.local",
          intents: [],
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch spending intents",
        intents: [],
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

// POST - Create new spending intent
export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, amount, description, merchant, category } = body;

    // Validate required fields
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: "Type, amount, and description are required" },
        { status: 400 }
      );
    }

    // Validate intent type
    const validTypes = [
      "merchant_payment",
      "saas_subscription",
      "p2p_transfer",
      "contract_interaction",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid intent type" },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const intentId = `intent-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const createdAt = Date.now();

    // In Edge Runtime, always use Supabase client
    if (!db || !isDatabaseConfigured()) {
      const { data: intent, error } = await supabase
        .from("spending_intents")
        .insert({
          id: intentId,
          user_email: userEmail,
          type,
          description: description.trim(),
          amount: amount.toString(),
          currency: "USDC",
          status: "pending_proof",
          merchant: merchant?.trim() || null,
          category: category?.trim() || null,
          created_at: createdAt,
          updated_at: null,
          proof_hash: null,
          executed_at: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to create intent", details: error.message },
          { status: 500 }
        );
      }

      // Format response
      const formattedIntent = {
        id: intent.id,
        userEmail: intent.user_email,
        type: intent.type,
        description: intent.description,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        merchant: intent.merchant,
        category: intent.category,
        createdAt: new Date(Number(intent.created_at)),
        updatedAt: intent.updated_at
          ? new Date(Number(intent.updated_at))
          : null,
        proofHash: intent.proof_hash,
        executedAt: intent.executed_at
          ? new Date(Number(intent.executed_at))
          : null,
      };

      return NextResponse.json({ intent: formattedIntent }, { status: 201 });
    }

    // Use Drizzle ORM for Node.js runtime
    const [intent] = await db
      .insert(spendingIntents)
      .values({
        id: intentId,
        userEmail,
        type,
        description: description.trim(),
        amount: amount.toString(),
        currency: "USDC",
        status: "pending_proof",
        merchant: merchant?.trim() || null,
        category: category?.trim() || null,
        createdAt,
        updatedAt: null,
        proofHash: null,
        executedAt: null,
      })
      .returning();

    // Format response
    const formattedIntent = {
      ...intent,
      createdAt: new Date(Number(intent.createdAt)),
      updatedAt: intent.updatedAt ? new Date(Number(intent.updatedAt)) : null,
      executedAt: intent.executedAt
        ? new Date(Number(intent.executedAt))
        : null,
    };

    return NextResponse.json({ intent: formattedIntent }, { status: 201 });
  } catch (error) {
    console.error("Error creating intent:", error);

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
        error: "Failed to create spending intent",
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
