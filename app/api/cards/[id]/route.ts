import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const email = request.headers.get("x-user-email");
  return email;
}

// PATCH - Update card (rename, freeze, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cardId = params.id;
    const body = await request.json();

    // Verify card belongs to user
    const card = db
      .prepare("SELECT * FROM virtual_cards WHERE id = ? AND user_email = ?")
      .get(cardId, userEmail);

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name.trim());
    }

    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }

    if (body.spendingLimit !== undefined) {
      updates.push("spending_limit = ?");
      values.push(body.spendingLimit);
    }

    if (body.balance !== undefined) {
      updates.push("balance = ?");
      values.push(body.balance);
    }

    if (body.lastUsed !== undefined) {
      updates.push("last_used = ?");
      values.push(body.lastUsed);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    values.push(cardId, userEmail);

    const stmt = db.prepare(`
      UPDATE virtual_cards 
      SET ${updates.join(", ")}
      WHERE id = ? AND user_email = ?
    `);

    stmt.run(...values);

    const updatedCard = db
      .prepare("SELECT * FROM virtual_cards WHERE id = ?")
      .get(cardId);

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE - Delete card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cardId = params.id;

    // Verify card belongs to user
    const card = db
      .prepare("SELECT * FROM virtual_cards WHERE id = ? AND user_email = ?")
      .get(cardId, userEmail);

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete card (transactions will be cascade deleted)
    db.prepare("DELETE FROM virtual_cards WHERE id = ? AND user_email = ?").run(
      cardId,
      userEmail
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
