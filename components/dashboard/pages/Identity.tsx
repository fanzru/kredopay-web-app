"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fingerprint,
  Shield,
  Key,
  Clock,
  UserX,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Laptop,
  Smartphone,
  Loader2,
  LogOut,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { StorageService } from "../services/storage";
import { useIdentityAuth } from "../hooks/useIdentityAuth";

export function Identity() {
  const router = useRouter();
  const {
    session,
    proofStatuses,
    devices,
    isLoading,
    error,
    isAuthenticated,
    rotateKeys,
    generateNewProof,
    revokeDevice,
    getTimeUntilExpiry,
  } = useIdentityAuth();

  const [isRotating, setIsRotating] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  const { showToast } = useToast();

  const handleRotateKeys = async () => {
    try {
      setIsRotating(true);
      await rotateKeys();
      showToast("success", "Keys rotated successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Key rotation failed"
      );
    } finally {
      setIsRotating(false);
    }
  };

  const handleGenerateProof = async () => {
    try {
      setIsGeneratingProof(true);
      await generateNewProof("solvency");
      showToast("success", "Proof generated successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Proof generation failed"
      );
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeDevice(deviceId);
      showToast("success", "Device revoked successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Device revocation failed"
      );
    }
  };

  const handleLogout = () => {
    StorageService.removeAuthToken();
    router.push("/login"); // Use router push to match import
    showToast("success", "Logged out successfully");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <LogOut className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Not Authenticated
          </h2>
          <p className="text-zinc-400 mb-6">
            Please login to view your identity information.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Accountless Identity
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ZK-Verified
            </span>
          </h1>
          <p className="text-zinc-500">
            Manage your ephemeral sessions and zero-knowledge proofs.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateKeys}
            disabled={isRotating || isLoading}
          >
            {isRotating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Rotate Keys
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateProof}
            disabled={isGeneratingProof || isLoading}
          >
            {isGeneratingProof ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="mr-2 h-4 w-4" />
            )}
            New Proof
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Hero Status Card */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-1">
        <div className="rounded-xl bg-zinc-950/50 p-6 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative h-24 w-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                <UserX className="h-10 w-10 text-zinc-400 group-hover:text-white transition-colors" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-zinc-900 rounded-full p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-xl font-semibold text-white">
                You are Anonymous
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl">
                This session is not linked to any permanent on-chain identifier.
                Your actions are authorized via Zero-Knowledge Proofs related to
                your real-world assets/identity, without revealing them.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2 flex-wrap">
                {session?.email && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                    <Mail className="h-3 w-3" />
                    <span>{session.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                  <Clock className="h-3 w-3" />
                  <span>
                    Session expires in {getTimeUntilExpiry() || "..."}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                  <Key className="h-3 w-3" />
                  <span>Session ID: {session?.sessionId || "..."}</span>
                </div>
              </div>
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 border-red-900/30 hover:bg-red-900/10 hover:border-red-900/50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Session Details */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-900/20 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Current Proofs</h3>
          </div>

          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="h-4 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
                  </div>
                ))
              : proofStatuses.map((proof, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {proof.label}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(proof.lastVerified).toLocaleTimeString()}
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-md border ${
                        proof.status === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : proof.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {proof.status === "verified"
                        ? "Verified"
                        : proof.status === "pending"
                        ? "Pending Re-verify"
                        : "Expired"}
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Device & Persona Management */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-900/20 text-blue-400">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Device Sessions
            </h3>
          </div>

          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-zinc-800/50 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-24 bg-zinc-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              : devices.map((device) => (
                  <div
                    key={device.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      device.isCurrent
                        ? "bg-zinc-900/80 border-zinc-700/50"
                        : "bg-zinc-900/30 border-zinc-800/30 opacity-60"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center border border-zinc-800 text-zinc-400">
                      {device.deviceType === "laptop" ? (
                        <Laptop size={20} />
                      ) : device.deviceType === "tablet" ? (
                        <Laptop size={20} />
                      ) : (
                        <Smartphone size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            device.isCurrent ? "text-white" : "text-zinc-300"
                          }`}
                        >
                          {device.deviceName} {device.isCurrent && "(Current)"}
                        </p>
                        {device.isCurrent && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {device.location} • {device.browser}
                      </p>
                    </div>
                    <button
                      className="h-8 w-8 p-0 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => handleRevokeDevice(device.id)}
                      disabled={device.isCurrent}
                    >
                      <UserX
                        className={`h-4 w-4 ${
                          device.isCurrent
                            ? "text-zinc-600"
                            : "text-zinc-500 hover:text-red-400"
                        }`}
                      />
                    </button>
                  </div>
                ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              className="w-full border-dashed border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white"
              onClick={() => alert("Connect new device feature coming soon!")}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Connect New Device
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
