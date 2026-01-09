"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type KYCStatus = "not_submitted" | "pending" | "verified" | "rejected";

interface KYCData {
  status: KYCStatus;
  fullName?: string;
  idNumber?: string;
  submittedAt?: number;
  verifiedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

export function Identity() {
  const router = useRouter();
  const { showToast } = useToast();

  const [kycStatus, setKycStatus] = useState<KYCData>({
    status: "not_submitted",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");

  // Image state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string>("");

  // Camera state
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const [showIdCamera, setShowIdCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch KYC status on mount
  React.useEffect(() => {
    const fetchKYCStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/kyc/status");
        if (response.ok) {
          const data = await response.json();
          setKycStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch KYC status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKYCStatus();
  }, []);

  // Start camera
  const startCamera = async (type: "selfie" | "id") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: type === "selfie" ? "user" : "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (type === "selfie") {
        setShowSelfieCamera(true);
      } else {
        setShowIdCamera(true);
      }
    } catch (error) {
      showToast("error", "Camera access denied");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowSelfieCamera(false);
    setShowIdCamera(false);
  };

  // Capture photo
  const capturePhoto = (type: "selfie" | "id") => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${type}-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const preview = URL.createObjectURL(blob);

      if (type === "selfie") {
        setSelfieFile(file);
        setSelfiePreview(preview);
      } else {
        setIdCardFile(file);
        setIdCardPreview(preview);
      }
      stopCamera();
    }, "image/jpeg");
  };

  // Handle file upload
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "selfie" | "id"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Please upload an image file");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === "selfie") {
      setSelfieFile(file);
      setSelfiePreview(preview);
    } else {
      setIdCardFile(file);
      setIdCardPreview(preview);
    }
  };

  // Submit KYC
  const handleSubmit = async () => {
    if (!fullName || !idNumber || !selfieFile || !idCardFile) {
      showToast("error", "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("idNumber", idNumber);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("nationality", nationality);
      formData.append("selfie", selfieFile);
      formData.append("idCard", idCardFile);

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit KYC");
      }

      const data = await response.json();
      setKycStatus({
        status: "pending",
        fullName,
        idNumber,
        submittedAt: Date.now(),
      });

      showToast(
        "success",
        "KYC submitted successfully! Verification in progress."
      );
    } catch (error) {
      showToast("error", "Failed to submit KYC. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render status badge
  const renderStatusBadge = () => {
    switch (kycStatus.status) {
      case "pending":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
            <span className="text-sm font-semibold text-yellow-300">
              Verification Pending
            </span>
          </div>
        );
      case "verified":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">
              Verified
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  // If pending or verified, show status
  if (kycStatus.status === "pending" || kycStatus.status === "verified") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Identity Verification
          </h1>
          <p className="text-sm text-zinc-400">Your KYC verification status</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Verification Status
            </h3>
            {renderStatusBadge()}
          </div>

          {kycStatus.status === "pending" && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-300 mb-1">
                    Verification in Progress
                  </p>
                  <p className="text-xs text-blue-200/70 leading-relaxed">
                    Your identity documents are being reviewed by our team. This
                    process typically takes <strong>10-14 business days</strong>
                    . We'll notify you once verification is complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {kycStatus.status === "verified" && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-300 mb-1">
                    Identity Verified
                  </p>
                  <p className="text-xs text-green-200/70 leading-relaxed">
                    Your identity has been successfully verified. You can now
                    activate your virtual cards and start spending.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Full Name</span>
              <span className="text-white font-medium">
                {kycStatus.fullName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">ID Number</span>
              <span className="text-white font-medium">
                {kycStatus.idNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Submitted</span>
              <span className="text-white font-medium">
                {kycStatus.submittedAt
                  ? new Date(kycStatus.submittedAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show camera modal
  if (showSelfieCamera || showIdCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 bg-zinc-900 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
          <Button
            onClick={() => capturePhoto(showSelfieCamera ? "selfie" : "id")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        </div>
      </div>
    );
  }

  // Show KYC form
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Identity Verification
        </h1>
        <p className="text-sm text-zinc-400">
          Complete KYC to activate your virtual card
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Personal Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As shown on ID"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                ID Number *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Passport or National ID number"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g., Indonesian"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Identity Documents
          </h3>

          {/* Selfie */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Selfie Photo *
            </label>
            {selfiePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-zinc-700">
                <img
                  src={selfiePreview}
                  alt="Selfie"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setSelfieFile(null);
                    setSelfiePreview("");
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <XCircle className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startCamera("selfie")}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-6 hover:border-blue-500 hover:bg-zinc-800 transition-colors"
                >
                  <Camera className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-400">
                    Take Photo
                  </span>
                </button>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-6 hover:border-blue-500 hover:bg-zinc-800 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-400">
                    Upload File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "selfie")}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* ID Card */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              ID Card / Passport *
            </label>
            {idCardPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-zinc-700">
                <img
                  src={idCardPreview}
                  alt="ID Card"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setIdCardFile(null);
                    setIdCardPreview("");
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <XCircle className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startCamera("id")}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-6 hover:border-blue-500 hover:bg-zinc-800 transition-colors"
                >
                  <Camera className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-400">
                    Take Photo
                  </span>
                </button>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-6 hover:border-blue-500 hover:bg-zinc-800 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-400">
                    Upload File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "id")}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-1">
                Verification Timeline
              </p>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Your documents will be reviewed within{" "}
                <strong>10-14 business days</strong>. Make sure all information
                is clear and matches your official ID.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !fullName ||
              !idNumber ||
              !selfieFile ||
              !idCardFile
            }
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
