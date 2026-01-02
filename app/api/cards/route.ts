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

    const cards = db
      .prepare(
        `SELECT * FROM virtual_cards WHERE user_email = ? ORDER BY created_at DESC`
      )
      .all(userEmail);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
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

    const cardId = `card-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const cardNumber = generateCardNumber();
    const expiryDate = generateExpiryDate();
    const cvv = generateCVV();
    const createdAt = Date.now();

    const stmt = db.prepare(`
      INSERT INTO virtual_cards (
        id, user_email, name, card_number, expiry_date, cvv,
        balance, currency, status, spending_limit, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      cardId,
      userEmail,
      name.trim(),
      cardNumber,
      expiryDate,
      cvv,
      0,
      "USDC",
      "active",
      spendingLimit || null,
      createdAt
    );

    const card = db
      .prepare("SELECT * FROM virtual_cards WHERE id = ?")
      .get(cardId);

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
