import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { kycVerifications } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "kredopay-kyc";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const runtime = "nodejs";

async function uploadToR2(file: File, path: string): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2 using S3 SDK
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return public URL
    return `${R2_PUBLIC_URL}/${path}`;
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error("Failed to upload to R2");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const idNumber = formData.get("idNumber") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const selfieFile = formData.get("selfie") as File;
    const idCardFile = formData.get("idCard") as File;

    if (!fullName || !idNumber || !selfieFile || !idCardFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has KYC submission
    const existing = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userEmail, userEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "KYC already submitted" },
        { status: 400 }
      );
    }

    // Generate unique paths for R2
    const timestamp = Date.now();
    const selfiePath = `kyc/${userEmail}/selfie-${timestamp}.jpg`;
    const idCardPath = `kyc/${userEmail}/idcard-${timestamp}.jpg`;

    // Upload to R2
    const selfieUrl = await uploadToR2(selfieFile, selfiePath);
    const idCardUrl = await uploadToR2(idCardFile, idCardPath);

    // Save to database
    const kycId = `KYC-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(kycVerifications).values({
      id: kycId,
      userEmail,
      fullName,
      idNumber,
      dateOfBirth: dateOfBirth || null,
      nationality: nationality || null,
      selfiePath: selfieUrl,
      idCardPath: idCardUrl,
      status: "pending",
      submittedAt: timestamp,
    });

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully",
      kycId,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    );
  }
}
