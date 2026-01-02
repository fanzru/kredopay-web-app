import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Helper to get user email from token
function getUserEmailFromToken(request: NextRequest): string | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const email = request.headers.get("x-user-email");
  return email;
}

// DELETE - Cancel/delete a spending intent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intentId = params.id;

    // Check if intent exists and belongs to user
    const intent = db
      .prepare("SELECT * FROM spending_intents WHERE id = ? AND user_email = ?")
      .get(intentId, userEmail) as any;

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
    const stmt = db.prepare(
      "DELETE FROM spending_intents WHERE id = ? AND user_email = ?"
    );
    stmt.run(intentId, userEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting intent:", error);
    return NextResponse.json(
      { error: "Failed to delete intent" },
      { status: 500 }
    );
  }
}

// PATCH - Update intent status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intentId = params.id;
    const body = await request.json();
    const { status, proofHash } = body;

    // Check if intent exists and belongs to user
    const intent = db
      .prepare("SELECT * FROM spending_intents WHERE id = ? AND user_email = ?")
      .get(intentId, userEmail) as any;

    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

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

    const updatedAt = Date.now();
    const executedAt = status === "executed" ? Date.now() : intent.executed_at;

    // Update the intent
    const stmt = db.prepare(`
      UPDATE spending_intents
      SET status = ?, proof_hash = ?, updated_at = ?, executed_at = ?
      WHERE id = ? AND user_email = ?
    `);

    stmt.run(
      status || intent.status,
      proofHash || intent.proof_hash,
      updatedAt,
      executedAt,
      intentId,
      userEmail
    );

    // Fetch updated intent
    const updatedIntent = db
      .prepare("SELECT * FROM spending_intents WHERE id = ?")
      .get(intentId) as any;

    // Format response
    const formattedIntent = {
      ...updatedIntent,
      createdAt: new Date(updatedIntent.created_at),
      updatedAt: updatedIntent.updated_at
        ? new Date(updatedIntent.updated_at)
        : null,
      executedAt: updatedIntent.executed_at
        ? new Date(updatedIntent.executed_at)
        : null,
    };

    return NextResponse.json({ intent: formattedIntent });
  } catch (error) {
    console.error("Error updating intent:", error);
    return NextResponse.json(
      { error: "Failed to update intent" },
      { status: 500 }
    );
  }
}
