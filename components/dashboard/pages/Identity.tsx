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
  RefreshCw,
  Fingerprint,
  Clock,
  Key,
  LogOut,
  Eye,
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
  const [isLoading, setIsLoading] = useState(true);
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

  // Viewing state
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Fetch KYC status on mount
  React.useEffect(() => {
    const fetchKYCStatus = async () => {
      setIsLoading(true);
      try {
        const userEmail = localStorage.getItem("kredo_user_email") || "";
        const token = localStorage.getItem("kredo_auth_token") || "";

        const response = await fetch("/api/kyc/status", {
          headers: {
            "X-User-Email": userEmail,
            Authorization: `Bearer ${token}`,
          },
        });

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
      // Get user email and token from localStorage
      const userEmail = localStorage.getItem("kredo_user_email") || "";
      const token = localStorage.getItem("kredo_auth_token") || "";

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("idNumber", idNumber);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("nationality", nationality);
      formData.append("selfie", selfieFile);
      formData.append("idCard", idCardFile);

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "X-User-Email": userEmail,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit KYC");
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
      console.error("KYC submission error:", error);
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to submit KYC. Please try again."
      );
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-zinc-400">Loading verification status...</p>
      </div>
    );
  }

  // If pending or verified, show status
  if (kycStatus.status === "pending" || kycStatus.status === "verified") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
        <AccountlessSection />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Identity Verification
          </h1>
          <p className="text-sm text-zinc-400">Your KYC verification status</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
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
                    Your identity documents are being reviewed by our Visa
                    Issuance team. This process typically takes{" "}
                    <strong>10-14 business days</strong>. We'll notify you once
                    verification is complete.
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

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm py-2 border-b border-zinc-900">
              <span className="text-zinc-500">Full Name</span>
              <span className="text-white font-medium">
                {kycStatus.fullName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-zinc-900">
              <span className="text-zinc-500">ID Number</span>
              <span className="text-white font-medium">
                {kycStatus.idNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
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
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="w-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
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

  // Show image preview modal
  if (viewingImage) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
          <img
            src={viewingImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <Button
            variant="outline"
            onClick={() => setViewingImage(null)}
            className="mt-6 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"
          >
            Close Preview
          </Button>
        </div>
      </div>
    );
  }

  // Show KYC form
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      <AccountlessSection />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Identity Verification
        </h1>
        <p className="text-sm text-zinc-400">
          Complete KYC to activate your virtual card
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
            <User className="h-5 w-5 text-blue-400" />
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As shown on ID"
                className="w-full bg-transparent border-b border-zinc-800 px-0 py-2 text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                ID Number *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Passport or National ID number"
                className="w-full bg-transparent border-b border-zinc-800 px-0 py-2 text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-0 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 px-0 py-2 text-white outline-none focus:border-blue-500 focus:ring-0 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g., American"
                  className="w-full bg-transparent border-b border-zinc-800 px-0 py-2 text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-0 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Identity Documents
          </h3>

          {/* Selfie */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Selfie Photo *
              </label>
              <p className="text-xs text-zinc-500">
                Take a clear photo of your face
              </p>
            </div>

            {selfieFile ? (
              <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800">
                <span className="text-xs text-zinc-300 max-w-[120px] truncate">
                  {selfieFile.name}
                </span>
                <button
                  onClick={() => setViewingImage(selfiePreview)}
                  className="text-zinc-500 hover:text-blue-400 transition-colors"
                  title="View image"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelfieFile(null);
                    setSelfiePreview("");
                  }}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove image"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => startCamera("selfie")}
                  className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Camera
                </button>
                <label className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
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
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                ID Card / Passport *
              </label>
              <p className="text-xs text-zinc-500">Official government ID</p>
            </div>

            {idCardFile ? (
              <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800">
                <span className="text-xs text-zinc-300 max-w-[120px] truncate">
                  {idCardFile.name}
                </span>
                <button
                  onClick={() => setViewingImage(idCardPreview)}
                  className="text-zinc-500 hover:text-blue-400 transition-colors"
                  title="View image"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIdCardFile(null);
                    setIdCardPreview("");
                  }}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove image"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => startCamera("id")}
                  className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Camera
                </button>
                <label className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
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

        {/* Info & Submit */}
        <div className="pt-4">
          {/* Info */}
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-300 mb-1">
                  Verification Timeline
                </p>
                <p className="text-xs text-blue-200/50 leading-relaxed">
                  Your documents will be reviewed within{" "}
                  <strong>10-14 business days</strong>. Make sure all
                  information is clear and matches your official ID.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="w-1/3 bg-transparent border-zinc-800 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={
                isSubmitting ||
                !fullName ||
                !idNumber ||
                !selfieFile ||
                !idCardFile
              }
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountlessSection() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-white">
              Accountless Identity
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-xs font-medium text-purple-300">
                ZK-Verified
              </span>
            </div>
          </div>
          <div className="flex gap-2 sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rotate Keys
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 text-white"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              New Proof
            </Button>
          </div>
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Manage your ephemeral sessions and zero-knowledge proofs without
          exposing your real identity.
        </p>
      </div>

      <div className="relative overflow-hidden pt-6 border-t border-zinc-800">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center shadow-xl">
                <User className="h-8 w-8 text-zinc-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 h-7 w-7 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-lg">
                <CheckCircle className="h-3.5 w-3.5 text-white stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  You are Anonymous
                </h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                  This session is independent of your permanent on-chain
                  identity. Your actions are cryptographically authorized via
                  Zero-Knowledge Proofs.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  dev@kredopay.app
                </div>
                <div className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Expires in 3h 45m
                </div>
                <div className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-zinc-500" />
                  ID: dev...e7a9
                </div>
              </div>
            </div>

            <div className="sm:ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
