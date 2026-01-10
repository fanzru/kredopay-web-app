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

// POST - Reject internal top-up (Admin only)
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
    const { adminEmail, rejectionReason, adminNotes } = body;

    if (!rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

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

    // Reject the request
    const { data: updatedTopup, error: rejectError } = await supabase
      .from("internal_topup_requests")
      .update({
        status: "rejected",
        rejected_at: now,
        rejection_reason: rejectionReason,
        admin_notes: adminNotes || `Rejected by ${adminEmail || "admin"}`,
      })
      .eq("id", topupId)
      .select()
      .single();

    if (rejectError) {
      console.error("Error rejecting topup:", rejectError);
      return NextResponse.json(
        {
          error: "Failed to reject top-up request",
          details: rejectError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Top-up request rejected successfully",
      topup: {
        id: updatedTopup.id,
        userEmail: updatedTopup.user_email,
        requestedAmount: updatedTopup.requested_amount,
        exactAmount: updatedTopup.exact_amount,
        status: updatedTopup.status,
        rejectedAt: updatedTopup.rejected_at,
        rejectionReason: updatedTopup.rejection_reason,
        adminNotes: updatedTopup.admin_notes,
      },
    });
  } catch (error) {
    console.error("Error rejecting top-up:", error);
    return NextResponse.json(
      {
        error: "Failed to reject top-up",
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
