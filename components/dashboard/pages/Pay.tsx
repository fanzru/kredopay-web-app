"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scan, ArrowLeft, QrCode, Loader2, AlertCircle, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "../hooks/useVirtualCards";

export function Pay() {
  const router = useRouter();
  const { showToast } = useToast();
  const { cards, getTotalBalance } = useVirtualCards();
  
  const [scanMode, setScanMode] = useState(false);
  const [merchantCode, setMerchantCode] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalBalance = getTotalBalance();

  const handleScan = () => {
    setScanMode(true);
    showToast("info", "QR scanner coming soon! Enter code manually for now.");
    // TODO: Implement QR scanner
  };

  const handlePay = async () => {
    if (!merchantCode.trim()) {
      showToast("warning", "Please enter merchant code or scan QR");
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
      // TODO: Implement actual payment logic with ZK proof
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("success", "Payment completed successfully!");
      router.push("/dashboard");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to process payment"
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
          <h1 className="text-2xl font-bold text-white">Pay Merchant</h1>
          <p className="text-zinc-500 text-sm">Scan QR or enter merchant code</p>
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
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Wallet className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* QR Scanner Placeholder */}
      {scanMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
        >
          <div className="aspect-square max-w-md mx-auto rounded-xl border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center">
            <div className="text-center space-y-4">
              <QrCode className="h-24 w-24 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">QR Scanner coming soon</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanMode(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6"
      >
        {/* Merchant Code / QR Scan */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Merchant Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value)}
              placeholder="Enter merchant code or scan QR"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 font-mono"
              disabled={isProcessing}
            />
            <Button
              onClick={handleScan}
              variant="outline"
              className="shrink-0"
            >
              <Scan className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">
            Scan QR code or enter merchant payment code
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

        {/* Card Selection (Optional) */}
        {cards.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Use Card (Optional)
            </label>
            <select
              value={selectedCard || ""}
              onChange={(e) => setSelectedCard(e.target.value || null)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              disabled={isProcessing}
            >
              <option value="">Use default balance</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} - ${card.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-purple-900/30 bg-purple-900/10 p-4">
          <AlertCircle className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-purple-200/80">
              Payment is processed instantly using zero-knowledge authorization. No
              merchant sees your identity or full balance.
            </p>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          disabled={isProcessing || !merchantCode.trim() || !amount || parseFloat(amount) <= 0}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Scan className="mr-2 h-5 w-5" />
              Pay Merchant
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

