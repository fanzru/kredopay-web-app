"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";

export function StatusBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111111] p-4 flex items-start gap-4">
      <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
        <ShieldCheck className="text-indigo-400" size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white">
          Authorization Status: Optimized
        </h4>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Your anonymity set is currently in the top 1% of the network.
          Liquidity fog coverage is dense.
        </p>
      </div>
      <button className="text-zinc-500 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
