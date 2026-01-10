import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // Check authentication (using header like other APIs)
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get KYC status (using Supabase for Edge Runtime)
    const { data: kyc, error } = await supabase
      .from("kyc_verifications")
      .select("*")
      .eq("user_email", userEmail)
      .limit(1);

    if (error) {
      console.error("❌ Supabase error getting KYC status:", error);
      return NextResponse.json(
        { error: "Failed to get KYC status", details: error.message },
        { status: 500 }
      );
    }

    if (!kyc || kyc.length === 0) {
      return NextResponse.json({
        status: "not_submitted",
      });
    }

    const kycData = kyc[0];

    return NextResponse.json({
      status: kycData.status,
      fullName: kycData.full_name,
      idNumber: kycData.id_number,
      submittedAt: kycData.submitted_at,
      verifiedAt: kycData.verified_at,
      rejectedAt: kycData.rejected_at,
      rejectionReason: kycData.rejection_reason,
    });
  } catch (error) {
    console.error("❌ KYC status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get KYC status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
