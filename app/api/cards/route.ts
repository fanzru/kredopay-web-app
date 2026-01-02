import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare Pages requires Edge Runtime
export const runtime = "edge";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// Generate card number
function generateCardNumber(): string {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.floor(1000 + Math.random() * 9000).toString());
  }
  return parts.join(" ");
}

// Generate expiry date (2 years from now)
function generateExpiryDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

// Generate CVV
function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// GET - List all cards for user
export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Edge Runtime: Always use Supabase client (postgres client not compatible)
    // Since we're using export const runtime = "edge", we MUST use Supabase
    try {
      const { data: cards, error } = await supabase
        .from("virtual_cards")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(100); // Limit results for performance

      if (error) {
        console.error("Supabase error:", error);
        // Return empty array instead of error to prevent UI breaking
        return NextResponse.json({ cards: [] });
      }

      // Map Supabase response to match Drizzle schema format
      const formattedCards = (cards || []).map((card: any) => ({
        id: card.id,
        cardNumber: card.card_number,
        expiryDate: card.expiry_date,
        cvv: card.cvv,
        balance: card.balance,
        currency: card.currency,
        status: card.status,
        spendingLimit: card.spending_limit,
        createdAt: card.created_at,
        lastUsed: card.last_used,
        userEmail: card.user_email,
        name: card.name,
      }));

      return NextResponse.json({ cards: formattedCards });
    } catch (err) {
      console.error("Supabase query timeout or error:", err);
      // Return empty array on timeout/error to prevent UI breaking
      return NextResponse.json({ cards: [] });
    }
  } catch (error) {
    console.error("Error fetching cards:", error);

    // If database error, provide more helpful message
    if (error instanceof Error && error.message.includes("Failed query")) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check DATABASE_URL in .env.local",
          cards: [], // Return empty array as fallback
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch cards",
        cards: [], // Return empty array as fallback
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

// POST - Create new card
export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, spendingLimit } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Card name is required" },
        { status: 400 }
      );
    }

    // Edge Runtime: Always use Supabase client (postgres client not compatible)
    // Since we're using export const runtime = "edge", we MUST use Supabase
    const cardId = `card-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const cardNumber = generateCardNumber();
    const expiryDate = generateExpiryDate();
    const cvv = generateCVV();
    const createdAt = Date.now();

    try {
      const { data: card, error } = await supabase
        .from("virtual_cards")
        .insert({
          id: cardId,
          user_email: userEmail,
          name: name.trim(),
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv,
          balance: "0",
          currency: "USDC",
          status: "active",
          spending_limit: spendingLimit ? spendingLimit.toString() : null,
          created_at: createdAt,
          last_used: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to create card", details: error.message },
          { status: 500 }
        );
      }

      // Map Supabase response to match Drizzle schema format
      const formattedCard = {
        id: card.id,
        cardNumber: card.card_number,
        expiryDate: card.expiry_date,
        cvv: card.cvv,
        balance: card.balance,
        currency: card.currency,
        status: card.status,
        spendingLimit: card.spending_limit,
        createdAt: card.created_at,
        lastUsed: card.last_used,
        userEmail: card.user_email,
        name: card.name,
      };

      return NextResponse.json({ card: formattedCard }, { status: 201 });
    } catch (err) {
      console.error("Supabase insert timeout or error:", err);
      return NextResponse.json(
        {
          error: "Failed to create card",
          details:
            err instanceof Error ? err.message : "Request timeout or error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating card:", error);

    // If database error, provide more helpful message
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
        error: "Failed to create card",
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
