import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  // In production, decode JWT token
  // For now, get from localStorage (passed in header)
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

    const intents = db
      .prepare(
        `SELECT * FROM spending_intents WHERE user_email = ? ORDER BY created_at DESC`
      )
      .all(userEmail);

    // Convert timestamps to Date objects for consistency
    const formattedIntents = intents.map((intent: any) => ({
      ...intent,
      createdAt: new Date(intent.created_at),
      updatedAt: intent.updated_at ? new Date(intent.updated_at) : null,
      executedAt: intent.executed_at ? new Date(intent.executed_at) : null,
    }));

    return NextResponse.json({ intents: formattedIntents });
  } catch (error) {
    console.error("Error fetching intents:", error);
    return NextResponse.json(
      { error: "Failed to fetch spending intents" },
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

    const stmt = db.prepare(`
      INSERT INTO spending_intents (
        id, user_email, type, description, amount, currency,
        status, merchant, category, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      intentId,
      userEmail,
      type,
      description.trim(),
      amount,
      "USDC",
      "pending_proof",
      merchant?.trim() || null,
      category?.trim() || null,
      createdAt
    );

    const intent = db
      .prepare("SELECT * FROM spending_intents WHERE id = ?")
      .get(intentId) as any;

    // Format response
    const formattedIntent = {
      ...intent,
      createdAt: new Date(intent.created_at),
      updatedAt: intent.updated_at ? new Date(intent.updated_at) : null,
      executedAt: intent.executed_at ? new Date(intent.executed_at) : null,
    };

    return NextResponse.json({ intent: formattedIntent }, { status: 201 });
  } catch (error) {
    console.error("Error creating intent:", error);
    return NextResponse.json(
      { error: "Failed to create spending intent" },
      { status: 500 }
    );
  }
}
