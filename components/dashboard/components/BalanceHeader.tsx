"use client";

import React from "react";
import { Ghost } from "lucide-react";

interface BalanceHeaderProps {
  balance: number;
  proofCount?: number;
  changeAmount?: number;
  changePercentage?: number;
}

export function BalanceHeader({
  balance,
  proofCount = 254,
  changeAmount = 0.01,
  changePercentage = 0.31,
}: BalanceHeaderProps) {
  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </h1>
        <div className="px-2.5 py-1 rounded-full bg-[#2a1a15] border border-orange-900/50 flex items-center gap-1.5">
          <Ghost size={12} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-500">
            {proofCount} ZK-Proofs
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-emerald-400">
          +${changeAmount.toFixed(2)} (+{changePercentage.toFixed(2)}%)
        </span>
        <span className="text-sm text-zinc-500">Global Spending Power</span>
      </div>
    </div>
  );
}
