"use client";

import React from "react";
import { Network, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export type NetworkType = "solana" | "ethereum" | "internal";

interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onSelect: (network: NetworkType) => void;
}

export function NetworkSelector({
  selectedNetwork,
  onSelect,
}: NetworkSelectorProps) {
  const networkOptions = [
    { id: "internal", name: "Internal", icon: <User size={16} /> },
    { id: "solana", name: "Solana", icon: <Network size={16} /> },
    { id: "ethereum", name: "Ethereum", icon: <Network size={16} /> },
  ];

  return (
    <div className="mb-6 sm:mb-10">
      <div className="grid grid-cols-3 bg-zinc-900/50 p-1 rounded-2xl">
        {networkOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id as NetworkType)}
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
  );
}
