"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Copy,
  Check,
  Wallet,
  Loader2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Link2,
  Moon,
  CheckCircle2,
  DollarSign,
  MapPin,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "@/components/dashboard/hooks/useVirtualCards";

interface DepositRequest {
  id: string;
  userEmail: string;
  requestedAmount?: string;
  exactAmount?: string;
  amount: string;
  currency: string;
  uniqueCode: string;
  walletAddress: string;
  status: "pending" | "completed" | "failed" | "expired";
  cardId: string | null;
  createdAt: number;
  expiresAt: number;
  completedAt: number | null;
  transactionHash: string | null;
  decimalCode?: string;
}

interface InternalTopupRequest {
  id: string;
  userEmail: string;
  requestedAmount: string;
  exactAmount: string;
  decimalCode: string;
  currency: string;
  userWalletAddress: string;
  solanaWalletAddress: string;
  topupMethod: "wallet_address" | "moonpay";
  status: "pending" | "approved" | "rejected" | "completed";
  cardId: string | null;
  createdAt: number;
}

export default function TopUpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { cards } = useVirtualCards();

  const [topupMethod, setTopupMethod] = useState<
    "deposit" | "internal" | "moonpay"
  >("internal");
  const [amount, setAmount] = useState("");
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [depositRequest, setDepositRequest] = useState<DepositRequest | null>(
    null
  );
  const [internalTopupRequest, setInternalTopupRequest] =
    useState<InternalTopupRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedExactAmount, setCopiedExactAmount] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const handleCreateInternalTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 1) {
      showToast("warning", "Minimum top-up amount is $1");
      return;
    }

    if (!userWalletAddress || userWalletAddress.length < 10) {
      showToast("warning", "Please enter a valid wallet address");
      return;
    }

    if (!selectedCardId) {
      showToast("warning", "Please select a card");
      return;
    }

    try {
      setIsCreating(true);
      const userEmail = localStorage.getItem("kredo_user_email");
      const token = localStorage.getItem("kredo_auth_token");

      const response = await fetch("/api/internal-topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Email": userEmail || "",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          userWalletAddress: userWalletAddress,
          cardId: selectedCardId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create top-up request");
      }

      const data = await response.json();
      setInternalTopupRequest(data.topup);
      showToast(
        "success",
        "Top-up request created! Transfer the exact amount shown below."
      );
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create top-up request"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "address") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
      showToast("success", "Copied to clipboard!");
    } catch (err) {
      showToast("error", "Failed to copy to clipboard");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24 px-3 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Top Up Balance</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!internalTopupRequest ? (
          // Step 1: Create Request
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                Top-Up Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTopupMethod("internal")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    topupMethod === "internal"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50"
                  }`}
                >
                  <Link2 className="h-5 w-5 mb-2 text-blue-400" />
                  <div className="text-sm font-medium text-white">
                    Wallet Transfer
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Manual approval
                  </div>
                </button>

                <button
                  onClick={() => setTopupMethod("moonpay")}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 transition-all relative opacity-50 cursor-not-allowed"
                  disabled
                >
                  <span className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                  <Moon className="h-5 w-5 mb-2 text-yellow-400" />
                  <div className="text-sm font-medium text-zinc-500">
                    MoonPay
                  </div>
                  <div className="text-[10px] text-zinc-600">Card payment</div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                    ) {
                      setAmount(value);
                    }
                  }}
                  placeholder="100.00"
                  min="1"
                  step="0.01"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/30 pl-9 pr-4 py-3 text-lg text-white placeholder-zinc-600 outline-none transition-all focus:border-zinc-700 focus:bg-zinc-900/50"
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                Min: $1 | Max: $100,000
              </p>
            </div>

            {/* Card Selection */}
            {cards.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Credit to Card <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCardId || ""}
                  onChange={(e) => setSelectedCardId(e.target.value || null)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-zinc-700 focus:bg-zinc-900/50"
                  disabled={isCreating}
                >
                  <option value="">Select a card...</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} (${card.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {!selectedCardId && (
                  <p className="text-[10px] text-red-400 mt-1.5">Required</p>
                )}
              </div>
            )}

            {/* Wallet Address Input */}
            {topupMethod === "internal" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Your Wallet Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={userWalletAddress}
                  onChange={(e) => setUserWalletAddress(e.target.value)}
                  placeholder="Your Solana wallet address..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-zinc-700 focus:bg-zinc-900/50"
                  disabled={isCreating}
                />
              </div>
            )}

            {/* Info Banner - Compact */}
            <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
              <div className="flex gap-3">
                <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-300">
                    How it works
                  </p>
                  <p className="text-[10px] text-blue-200/60 leading-relaxed">
                    We'll generate a unique amount. Transfer it to our wallet,
                    submit the hash, and your balance updates after
                    verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isCreating}
                className="flex-1 rounded-full bg-transparent border-zinc-800 hover:bg-zinc-900 h-12 text-xs font-bold tracking-widest uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInternalTopup}
                disabled={
                  isCreating ||
                  !amount ||
                  parseFloat(amount) < 1 ||
                  !userWalletAddress ||
                  userWalletAddress.length < 10 ||
                  !selectedCardId
                }
                className="flex-[1.5] rounded-full bg-gradient-to-r from-violet-900 to-pink-700 hover:from-violet-800 hover:to-pink-600 h-12 text-xs font-bold tracking-widest uppercase shadow-lg shadow-purple-900/20 border-0"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <div className="flex flex-col items-center leading-none py-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>Create Request</span>
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          // Step 2: Show Instructions
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Success Header */}
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                Request Created
              </h4>
              <p className="text-xs text-zinc-400">
                ID: {internalTopupRequest.id}
              </p>
            </div>

            {/* Exact Amount */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
                    Transfer Exactly
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-300">
                    ${parseFloat(internalTopupRequest.exactAmount).toFixed(4)}
                  </span>
                  <button
                    onClick={() => {
                      copyToClipboard(
                        parseFloat(internalTopupRequest.exactAmount).toFixed(4),
                        "code"
                      );
                    }}
                    className="p-1.5 rounded bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-yellow-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-yellow-200/60">
                  Includes unique code .{internalTopupRequest.decimalCode}
                </p>
              </div>
            </div>

            {/* Solana Wallet Address */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-3 w-3 text-zinc-500" />
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Send to Wallet
                </label>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 font-mono text-[10px] sm:text-xs text-white break-all">
                  {internalTopupRequest.solanaWalletAddress}
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      internalTopupRequest.solanaWalletAddress,
                      "address"
                    )
                  }
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 transition-colors"
                >
                  {copiedAddress ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Transaction Hash Submission */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                  Submit Proof
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value.trim())}
                  placeholder="Solana transaction hash..."
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/5"
                  disabled={isSubmittingTx}
                />
                <Button
                  onClick={async () => {
                    if (!txHash || txHash.length < 20) {
                      showToast(
                        "warning",
                        "Please enter a valid transaction hash"
                      );
                      return;
                    }

                    try {
                      setIsSubmittingTx(true);
                      const userEmail =
                        localStorage.getItem("kredo_user_email");
                      const token = localStorage.getItem("kredo_auth_token");

                      const response = await fetch(
                        `/api/internal-topup/${internalTopupRequest.id}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "X-User-Email": userEmail || "",
                          },
                          body: JSON.stringify({
                            transactionHash: txHash,
                          }),
                        }
                      );

                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(
                          error.error || "Failed to submit transaction hash"
                        );
                      }

                      setTxHash("");
                      showToast("success", "Submitted! Waiting for approval.");
                      router.push("/dashboard/topups");
                    } catch (err) {
                      showToast(
                        "error",
                        err instanceof Error
                          ? err.message
                          : "Failed to submit transaction hash"
                      );
                    } finally {
                      setIsSubmittingTx(false);
                    }
                  }}
                  disabled={isSubmittingTx || !txHash || txHash.length < 20}
                  className="rounded-full bg-gradient-to-r from-violet-900 to-pink-700 hover:from-violet-800 hover:to-pink-600 px-6 text-xs font-bold tracking-widest uppercase shadow-lg shadow-purple-900/20 border-0"
                  size="sm"
                >
                  {isSubmittingTx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row gap-6 pt-8 pb-4">
              <Button
                variant="outline"
                onClick={() => {
                  setInternalTopupRequest(null);
                  setAmount("");
                  setUserWalletAddress("");
                }}
                className="flex-1 rounded-full bg-transparent border-zinc-800 hover:bg-zinc-900 h-10 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              >
                New Request
              </Button>
              <Button
                onClick={() => router.push("/dashboard/topups")}
                className="flex-1 rounded-full bg-transparent border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-white h-10 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
                variant="ghost"
              >
                View History
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
