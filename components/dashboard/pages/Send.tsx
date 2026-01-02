"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Wallet, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "../hooks/useVirtualCards";

export function Send() {
  const router = useRouter();
  const { showToast } = useToast();
  const { cards, getTotalBalance } = useVirtualCards();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [memo, setMemo] = useState("");

  const totalBalance = getTotalBalance();

  const handleSend = async () => {
    if (!recipient.trim()) {
      showToast("warning", "Please enter recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > totalBalance) {
      showToast("error", "Insufficient balance");
      return;
    }

    try {
      setIsProcessing(true);
      // TODO: Implement actual send logic with ZK proof
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("success", "Payment sent successfully!");
      router.push("/dashboard");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to send payment"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Send Payment</h1>
          <p className="text-zinc-500 text-sm">Transfer funds to another address</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Available Balance</p>
            <h2 className="text-3xl font-bold text-white">
              ${totalBalance.toFixed(2)}
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Send Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6"
      >
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address or ENS name"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 font-mono"
            disabled={isProcessing}
          />
          <p className="text-xs text-zinc-600 mt-1.5">
            Enter a valid Solana wallet address
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Amount (USDC)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setAmount(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={totalBalance}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 pl-8 py-3 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              disabled={isProcessing}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-zinc-600">Maximum: ${totalBalance.toFixed(2)}</p>
            <button
              onClick={() => setAmount(totalBalance.toFixed(2))}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Use Max
            </button>
          </div>
        </div>

        {/* Memo (Optional) */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note for this transaction"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            disabled={isProcessing}
          />
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-900/30 bg-blue-900/10 p-4">
          <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-200/80">
              This payment will be processed using a zero-knowledge proof. Your identity
              and transaction details remain private.
            </p>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isProcessing || !recipient.trim() || !amount || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUpRight className="mr-2 h-5 w-5" />
              Send Payment
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

