"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Network,
  User,
  Loader2,
  Info,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "../hooks/useVirtualCards";

type NetworkType = "solana" | "ethereum" | "internal";

// Address validation utilities
const validateSolanaAddress = (address: string): boolean => {
  // Solana addresses are base58 encoded, typically 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};

const validateEthereumAddress = (address: string): boolean => {
  // Ethereum addresses start with 0x followed by 40 hex characters
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
};

const validateKredoID = (id: string): boolean => {
  // Kredo ID: alphanumeric, 3-20 characters, can include underscore/dash
  const kredoRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return kredoRegex.test(id);
};

export function Send() {
  const router = useRouter();
  const { showToast } = useToast();
  const { getTotalBalance } = useVirtualCards();

  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkType>("internal");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Real-time address validation
  const isAddressValid = useMemo(() => {
    if (!recipient.trim()) return null; // null = not yet entered

    switch (selectedNetwork) {
      case "solana":
        return validateSolanaAddress(recipient);
      case "ethereum":
        return validateEthereumAddress(recipient);
      case "internal":
        return validateKredoID(recipient);
      default:
        return false;
    }
  }, [recipient, selectedNetwork]);

  const totalBalance = getTotalBalance();

  const networkOptions = [
    { id: "internal", name: "Internal", icon: <User size={16} /> },
    { id: "solana", name: "Solana", icon: <Network size={16} /> },
    { id: "ethereum", name: "Ethereum", icon: <Network size={16} /> },
  ];

  const getRecipientPlaceholder = () => {
    switch (selectedNetwork) {
      case "internal":
        return "Enter Kredo ID / Username";
      case "solana":
        return "Solana Address (SOL)";
      case "ethereum":
        return "Ethereum Address (0x...)";
      default:
        return "Recipient";
    }
  };

  const getMaxAmount = () => {
    setAmount(totalBalance.toFixed(2));
  };

  const handleSend = async () => {
    // Validate recipient address
    if (!recipient.trim()) {
      showToast("warning", "Please enter a recipient");
      return;
    }

    // Check address format validity
    if (isAddressValid === false) {
      const networkName =
        selectedNetwork === "internal"
          ? "Kredo ID"
          : `${
              selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)
            } address`;
      showToast("error", `Invalid ${networkName} format`);
      return;
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Enter a valid amount");
      return;
    }

    // Check balance
    if (parseFloat(amount) > totalBalance) {
      showToast("error", "Insufficient balance");
      return;
    }

    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("success", "Transfer initiated successfully");
      router.push("/dashboard");
    } catch (err) {
      showToast("error", "Failed to send");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-2xl mx-auto pt-4 sm:pt-12 pb-20 px-4 min-h-[80vh] flex flex-col">
      {/* 1. Navbar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Send Money
          </h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* 2. Network Tabs */}
      <div className="mb-6 sm:mb-10">
        <div className="grid grid-cols-3 bg-zinc-900/50 p-1 rounded-2xl">
          {networkOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedNetwork(option.id as NetworkType);
                setRecipient("");
              }}
              className={`
                        relative flex flex-col items-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-300
                        ${
                          selectedNetwork === option.id
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }
                    `}
            >
              {/* Active Background Animation */}
              {selectedNetwork === option.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl shadow-lg border border-white/5 ${
                    option.id === "internal"
                      ? "bg-emerald-500/10"
                      : option.id === "solana"
                      ? "bg-blue-500/10"
                      : "bg-purple-500/10"
                  }`}
                />
              )}
              <span className="relative z-10">{option.icon}</span>
              <span className="relative z-10">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Network Badge */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <motion.div
            key={selectedNetwork}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider
                    ${
                      selectedNetwork === "internal"
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                        : selectedNetwork === "solana"
                        ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                        : "border-purple-500/20 bg-purple-500/5 text-purple-400"
                    }
                `}
          >
            <ShieldCheck size={10} />
            {selectedNetwork === "internal"
              ? "Instant & Fee-Free"
              : "ZK-Privacy Enabled"}
          </motion.div>
        </div>
      </div>

      {/* 3. Hero Amount Input */}
      <div className="flex-1 flex flex-col items-center justify-center mb-6 sm:mb-10 space-y-3 sm:space-y-4">
        <div className="relative w-full flex justify-center items-center">
          <span
            className={`text-3xl sm:text-6xl font-light mr-1 pb-1 sm:pb-2 ${
              amount ? "text-white" : "text-zinc-700"
            }`}
          >
            $
          </span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              // Prevent negative values and limiting decimals
              if (val.startsWith("-")) return;
              if (val.includes(".") && val.split(".")[1].length > 2) return;
              setAmount(val);
            }}
            onKeyDown={(e) => {
              // Prevent non-numeric keys like 'e', '-', '+' from affecting value
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="w-full max-w-[200px] sm:max-w-[400px] bg-transparent text-center text-5xl sm:text-7xl font-medium text-white placeholder:text-zinc-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <button
          onClick={getMaxAmount}
          className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] sm:text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
        >
          Balance: ${totalBalance.toFixed(2)}
        </button>
      </div>

      {/* 4. Form Fields */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {/* Recipient */}
        <div
          className={`group relative bg-zinc-900/30 rounded-2xl p-3 sm:p-4 border transition-colors focus-within:bg-zinc-900/80 ${
            isAddressValid === null
              ? "border-white/5 focus-within:border-zinc-700"
              : isAddressValid
              ? "border-emerald-500/30 focus-within:border-emerald-500/50"
              : "border-red-500/30 focus-within:border-red-500/50"
          }`}
        >
          <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5 sm:mb-1 block">
            To
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={getRecipientPlaceholder()}
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-700 focus:outline-none font-mono"
            />
            {/* Validation Icon */}
            {isAddressValid !== null && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {isAddressValid ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400 shrink-0"
                  />
                ) : (
                  <XCircle size={18} className="text-red-400 shrink-0" />
                )}
              </motion.div>
            )}
          </div>
          {/* Validation Helper Text */}
          {recipient.trim() && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[10px] mt-1.5 ${
                isAddressValid ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isAddressValid
                ? `✓ Valid ${
                    selectedNetwork === "internal"
                      ? "Kredo ID"
                      : selectedNetwork.charAt(0).toUpperCase() +
                        selectedNetwork.slice(1) +
                        " address"
                  }`
                : `✗ Invalid ${
                    selectedNetwork === "internal"
                      ? "Kredo ID"
                      : selectedNetwork.charAt(0).toUpperCase() +
                        selectedNetwork.slice(1) +
                        " address"
                  }`}
            </motion.p>
          )}
        </div>

        {/* Memo */}
        <div className="group relative bg-zinc-900/30 rounded-2xl p-3 sm:p-4 border border-white/5 transition-colors focus-within:bg-zinc-900/80 focus-within:border-zinc-700">
          <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5 sm:mb-1 block">
            Note
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="What is this for?"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-700 focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Action */}
      <Button
        size="lg"
        onClick={handleSend}
        disabled={
          isProcessing ||
          !recipient.trim() ||
          isAddressValid === false ||
          !amount ||
          parseFloat(amount) <= 0
        }
        className="w-full py-4 sm:py-6 rounded-2xl text-sm sm:text-base shadow-xl shadow-purple-500/10"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} /> Processing...
          </span>
        ) : (
          "Review & Send"
        )}
      </Button>
    </div>
  );
}
