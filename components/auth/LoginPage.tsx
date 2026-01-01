"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Wallet, ShieldCheck, Cpu, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function LoginPage() {
  const { setVisible } = useWalletModal();
  const { connected, disconnect } = useWallet();
  const router = useRouter();
  const [verificationState, setVerificationState] = useState<
    "idle" | "proving" | "verifying" | "complete"
  >("idle");

  useEffect(() => {
    if (connected && verificationState === "idle") {
      handleZKSequence();
    }
  }, [connected, verificationState]);

  const handleZKSequence = async () => {
    setVerificationState("proving");

    // Simulate ZK Proof Generation
    setTimeout(() => {
      setVerificationState("verifying");

      // Simulate On-Chain Verification
      setTimeout(() => {
        setVerificationState("complete");

        // Redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }, 1500);
    }, 2000);
  };

  const statusMessages = {
    idle: "Connect Signer",
    proving: "Generating Zero-Knowledge Proof...",
    verifying: "Verifying Access Policy...",
    complete: "Identity Anonymized. Access Granted.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm font-sans text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 md:p-10"
      >
        {/* Logo Section */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="relative mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 shadow-2xl p-4">
            <Image
              src="/logo.png"
              alt="Kredo Logo"
              fill
              className="object-contain p-3"
            />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Kredo App</h2>
          <p className="text-zinc-400">
            The first financial system where you never hold money. No accounts,
            no wallets.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              {verificationState === "idle"
                ? "Establish Session"
                : "Authenticating"}
            </span>
          </div>

          {/* Main Action / Status Area */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {verificationState === "idle" ? (
                <motion.button
                  key="connect-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setVisible(true)}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Authenticate Identity</span>
                </motion.button>
              ) : (
                <motion.div
                  key="status-display"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center justify-center gap-4 backdrop-blur-md"
                >
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    {/* Glowing Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-t-2 border-purple-500"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {verificationState === "proving" && (
                      <Cpu className="h-5 w-5 text-purple-400" />
                    )}
                    {verificationState === "verifying" && (
                      <Lock className="h-5 w-5 text-blue-400" />
                    )}
                    {verificationState === "complete" && (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-white mb-1">
                      {statusMessages[verificationState]}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Creating ephemeral session
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How It Works Probe */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group">
              <span className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-purple-500 transition-colors" />
              How accountless authentication works
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600">
            Protected by{" "}
            <span className="text-zinc-400 font-medium">ZK-SNARKs</span>
          </p>
        </div>
      </motion.div>

      {/* Footer Links */}
      <div className="absolute bottom-8 text-center text-xs text-zinc-600">
        <p>By transforming banking, you agree to our</p>
        <div className="mt-1 space-x-4">
          <Link
            href="/terms"
            className="hover:text-zinc-400 underline decoration-zinc-800"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-zinc-400 underline decoration-zinc-800"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
