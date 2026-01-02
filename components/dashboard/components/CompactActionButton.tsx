"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface CompactActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function CompactActionButton({
  icon: Icon,
  label,
  onClick,
}: CompactActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] border border-zinc-800 hover:border-zinc-700 py-4 rounded-2xl transition-all group"
    >
      <Icon
        size={20}
        className="text-zinc-400 group-hover:text-white transition-colors"
      />
      <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
    </button>
  );
}
