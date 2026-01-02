"use client";

import React from "react";
import { Card as CardType } from "../types";
import { Zap, Plus } from "lucide-react";
import { formatCurrency } from "../utils/helpers";

interface PermissionCardProps {
  card: CardType;
}

export function PermissionCard({ card }: PermissionCardProps) {
  return (
    <div className="w-full sm:w-[48%] h-36 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-zinc-800 p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all">
          <Zap size={14} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded">
          {card.type}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-300 truncate">
          {card.name}
        </p>
        <p className="text-xl font-bold text-white mt-0.5">
          ${formatCurrency(card.balance)}
        </p>
        <p className="text-[10px] text-zinc-600 font-mono mt-2">
          •••• {card.last4}
        </p>
      </div>
    </div>
  );
}

interface AddCardButtonProps {
  onClick: () => void;
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-[48%] h-36 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent flex flex-col items-center justify-center gap-2 text-zinc-700 hover:text-zinc-500 transition-all"
    >
      <Plus size={18} />
    </button>
  );
}
