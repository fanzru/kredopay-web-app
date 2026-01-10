import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "kredopay-kyc";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const runtime = "edge";

async function uploadToR2(file: File, path: string): Promise<string> {
  // If R2 credentials not configured, use placeholder (for development)
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn("⚠️  R2 credentials not configured, using placeholder URL");
    return `https://placeholder.r2.dev/${path}`;
  }

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
    console.error("❌ R2 upload error:", error);
    throw new Error("Failed to upload to R2");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication (using header like other APIs)
    const userEmail = req.headers.get("x-user-email");

    console.log("🔍 KYC submission attempt:", {
      hasHeader: !!userEmail,
      userEmail: userEmail || "NOT FOUND",
    });

    if (!userEmail) {
      console.error("❌ Unauthorized - No x-user-email header");
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: "Please login first.",
        },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const idNumber = formData.get("idNumber") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const selfieFile = formData.get("selfie") as File;
    const idCardFile = formData.get("idCard") as File;

    console.log("📝 KYC data:", { userEmail, fullName, idNumber });

    if (!fullName || !idNumber || !selfieFile || !idCardFile) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file sizes (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    if (selfieFile.size > MAX_FILE_SIZE) {
      console.error("❌ Selfie file too large:", selfieFile.size);
      return NextResponse.json(
        { error: "Selfie file must be less than 2MB" },
        { status: 400 }
      );
    }

    if (idCardFile.size > MAX_FILE_SIZE) {
      console.error("❌ ID card file too large:", idCardFile.size);
      return NextResponse.json(
        { error: "ID card file must be less than 2MB" },
        { status: 400 }
      );
    }

    console.log("✅ File sizes valid:", {
      selfie: `${(selfieFile.size / 1024).toFixed(2)}KB`,
      idCard: `${(idCardFile.size / 1024).toFixed(2)}KB`,
    });

    // Check if user already has KYC submission (using Supabase for Edge Runtime)
    const { data: existing, error: checkError } = await supabase
      .from("kyc_verifications")
      .select("*")
      .eq("user_email", userEmail)
      .limit(1);

    if (checkError) {
      console.error("❌ Supabase error checking existing KYC:", checkError);
      return NextResponse.json(
        { error: "Failed to check KYC status", details: checkError.message },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      console.warn("⚠️  KYC already submitted for:", userEmail);
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
    console.log("📤 Uploading selfie to R2...");
    const selfieUrl = await uploadToR2(selfieFile, selfiePath);
    console.log("✅ Selfie uploaded:", selfieUrl);

    console.log("📤 Uploading ID card to R2...");
    const idCardUrl = await uploadToR2(idCardFile, idCardPath);
    console.log("✅ ID card uploaded:", idCardUrl);

    // Save to database (using Supabase for Edge Runtime)
    const kycId = `KYC-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    console.log("💾 Saving KYC to database...", { kycId, userEmail });
    const { error: insertError } = await supabase
      .from("kyc_verifications")
      .insert({
        id: kycId,
        user_email: userEmail,
        full_name: fullName,
        id_number: idNumber,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || null,
        selfie_path: selfieUrl,
        id_card_path: idCardUrl,
        status: "pending",
        submitted_at: timestamp,
      });

    if (insertError) {
      console.error("❌ Supabase error inserting KYC:", insertError);
      return NextResponse.json(
        { error: "Failed to save KYC", details: insertError.message },
        { status: 500 }
      );
    }

    console.log("✅ KYC submitted successfully:", kycId);
    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully",
      kycId,
    });
  } catch (error) {
    console.error("❌ KYC submission error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit KYC",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
