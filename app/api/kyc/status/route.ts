import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { kycVerifications } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get KYC status
    const kyc = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userEmail, userEmail))
      .limit(1);

    if (kyc.length === 0) {
      return NextResponse.json({
        status: "not_submitted",
      });
    }

    const kycData = kyc[0];

    return NextResponse.json({
      status: kycData.status,
      fullName: kycData.fullName,
      idNumber: kycData.idNumber,
      submittedAt: kycData.submittedAt,
      verifiedAt: kycData.verifiedAt,
      rejectedAt: kycData.rejectedAt,
      rejectionReason: kycData.rejectionReason,
    });
  } catch (error) {
    console.error("KYC status error:", error);
    return NextResponse.json(
      { error: "Failed to get KYC status" },
      { status: 500 }
    );
  }
}
