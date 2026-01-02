"use client";

import React from "react";
import { Transaction } from "../hooks/useVirtualCards";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getIcon = () => {
    switch (transaction.type) {
      case "topup":
        return <Wallet size={16} />;
      case "payment":
        return <ArrowUpRight size={16} />;
      case "refund":
        return <ArrowDownLeft size={16} />;
      default:
        return null;
    }
  };

  const isCredit =
    transaction.type === "topup" || transaction.type === "refund";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center border border-white/5 ${
            isCredit
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-zinc-800/50 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white"
          } transition-all`}
        >
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
            {transaction.merchant}
          </p>
          <p className="text-[11px] text-zinc-500">
            {formatDate(transaction.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${
            isCredit ? "text-emerald-400" : "text-zinc-200"
          }`}
        >
          {isCredit ? "+" : "-"}${transaction.amount.toFixed(2)}
        </p>
        <p className="text-[10px] text-zinc-600 font-medium lowercase">
          {transaction.status}
        </p>
      </div>
    </div>
  );
}
