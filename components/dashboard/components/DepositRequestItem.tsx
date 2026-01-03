"use client";

import React, { useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { DepositRequest } from "../hooks/useDeposits";
import { useToast } from "@/components/ui/Toast";

interface DepositRequestItemProps {
  deposit: DepositRequest;
  onRefresh?: () => void;
}

export function DepositRequestItem({
  deposit,
  onRefresh,
}: DepositRequestItemProps) {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (deposit.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "failed":
      case "expired":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (deposit.status) {
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "failed":
      case "expired":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    }
  };

  const getStatusLabel = () => {
    switch (deposit.status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "expired":
        return "Expired";
      default:
        return "Pending";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };

  const getTimeRemaining = () => {
    if (deposit.status !== "pending") return null;
    const remaining = deposit.expiresAt - Date.now();
    if (remaining <= 0) return "Expired";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const copyToClipboard = async (text: string, type: "code" | "address") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
      showToast("success", "Copied to clipboard!");
    } catch (err) {
      showToast("error", "Failed to copy to clipboard");
    }
  };

  const timeRemaining = getTimeRemaining();
  const isExpired =
    deposit.status === "expired" ||
    (deposit.status === "pending" && Date.now() > deposit.expiresAt);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all overflow-hidden">
      {/* Main Row */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border ${
                deposit.status === "completed"
                  ? "bg-green-500/10 text-green-400 border-green-400/20"
                  : deposit.status === "failed" || deposit.status === "expired"
                  ? "bg-red-500/10 text-red-400 border-red-400/20"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-400/20"
              }`}
            >
              {getStatusIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">
                  ${parseFloat(deposit.amount).toFixed(2)} {deposit.currency}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor()}`}
                >
                  {getStatusIcon()}
                  {getStatusLabel()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{formatDate(deposit.createdAt)}</span>
                {timeRemaining && (
                  <>
                    <span>•</span>
                    <span className={isExpired ? "text-red-400" : ""}>
                      {timeRemaining}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-white">
              ${parseFloat(deposit.exactAmount || deposit.amount).toFixed(3)}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              {deposit.uniqueCode}
            </p>
            {deposit.requestedAmount && (
              <p className="text-[10px] text-zinc-600">
                Requested: ${parseFloat(deposit.requestedAmount).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4 bg-zinc-900/50">
          {/* Deposit Code */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
              Deposit Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 font-mono text-sm text-white">
                {deposit.uniqueCode}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(deposit.uniqueCode, "code");
                }}
                className="p-2 rounded-lg border border-zinc-800 bg-black/50 hover:bg-black/70 transition-colors"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
              Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 font-mono text-xs text-white break-all">
                {deposit.walletAddress}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(deposit.walletAddress, "address");
                }}
                className="p-2 rounded-lg border border-zinc-800 bg-black/50 hover:bg-black/70 transition-colors"
              >
                {copiedAddress ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Created</p>
              <p className="text-sm text-zinc-300">
                {new Date(deposit.createdAt).toLocaleString()}
              </p>
            </div>
            {deposit.completedAt && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Completed</p>
                <p className="text-sm text-zinc-300">
                  {new Date(deposit.completedAt).toLocaleString()}
                </p>
              </div>
            )}
            {deposit.transactionHash && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-300 font-mono break-all">
                    {deposit.transactionHash}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(deposit.transactionHash || "", "code");
                    }}
                    className="p-1.5 rounded border border-zinc-800 hover:bg-zinc-800 transition-colors"
                  >
                    <Copy className="h-3 w-3 text-zinc-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          {deposit.status === "pending" && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200/80">
                  Send exactly ${parseFloat(deposit.amount).toFixed(2)} to the
                  wallet address above and include the deposit code in the
                  transaction memo.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
