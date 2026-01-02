"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, ArrowDownUp, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "../hooks/useVirtualCards";

export function Swap() {
  const router = useRouter();
  const { showToast } = useToast();
  const { getTotalBalance } = useVirtualCards();
  
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SOL");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalBalance = getTotalBalance();

  // Mock exchange rate
  const exchangeRate = 0.00025; // 1 USDC = 0.00025 SOL

  const handleAmountChange = (value: string, direction: "from" | "to") => {
    if (direction === "from") {
      setFromAmount(value);
      if (value && !isNaN(parseFloat(value))) {
        const converted = (parseFloat(value) * exchangeRate).toFixed(6);
        setToAmount(converted);
      } else {
        setToAmount("");
      }
    } else {
      setToAmount(value);
      if (value && !isNaN(parseFloat(value))) {
        const converted = (parseFloat(value) / exchangeRate).toFixed(2);
        setFromAmount(converted);
      } else {
        setFromAmount("");
      }
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (parseFloat(fromAmount) > totalBalance) {
      showToast("error", "Insufficient balance");
      return;
    }

    try {
      setIsProcessing(true);
      // TODO: Implement actual swap logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("success", "Swap completed successfully!");
      router.push("/dashboard");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to complete swap"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
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
          <h1 className="text-2xl font-bold text-white">Swap Tokens</h1>
          <p className="text-zinc-500 text-sm">Exchange between different tokens</p>
        </div>
      </div>

      {/* Swap Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4"
      >
        {/* From Token */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-400">From</label>
            <span className="text-xs text-zinc-600">
              Balance: ${totalBalance.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    handleAmountChange(value, "from");
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
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-semibold text-white">{fromToken}</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={swapTokens}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            disabled={isProcessing}
          >
            <ArrowDownUp className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-400">To</label>
            <span className="text-xs text-zinc-600">Estimated</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    handleAmountChange(value, "to");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
                placeholder="0.00"
                step="0.000001"
                min="0"
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-semibold text-white">{toToken}</span>
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="flex items-center justify-between text-xs text-zinc-600 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
          <span>Exchange Rate</span>
          <span className="font-mono">
            1 {fromToken} = {(1 * exchangeRate).toFixed(6)} {toToken}
          </span>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-900/30 bg-blue-900/10 p-4">
          <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-200/80">
              Swaps are executed through liquidity fog pools. No slippage protection
              in testnet mode.
            </p>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isProcessing || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Swap...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Swap Tokens
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

