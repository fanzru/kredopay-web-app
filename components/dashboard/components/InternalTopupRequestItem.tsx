import React, { useState } from "react";
import {
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { InternalTopupRequest } from "../hooks/useInternalTopups";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface InternalTopupRequestItemProps {
  topup: InternalTopupRequest;
  onRefresh?: () => void;
}

export function InternalTopupRequestItem({
  topup,
  onRefresh,
}: InternalTopupRequestItemProps) {
  const { showToast } = useToast();
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = async (text: string, type: "amount" | "wallet") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "amount") {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      } else {
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmitTxHash = async () => {
    if (!txHash || txHash.length < 20) {
      showToast("warning", "Please enter a valid transaction hash");
      return;
    }

    try {
      setIsSubmitting(true);
      const userEmail = localStorage.getItem("kredo_user_email");
      const token = localStorage.getItem("kredo_auth_token");

      const response = await fetch(`/api/internal-topup/${topup.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Email": userEmail || "",
        },
        body: JSON.stringify({ transactionHash: txHash }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit transaction hash");
      }

      showToast(
        "success",
        "Transaction hash submitted! Waiting for verification."
      );
      setTxHash("");
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to submit transaction hash"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "approved":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "verifying":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "rejected":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "approved":
        return <AlertCircle className="h-4 w-4" />;
      case "verifying":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "approved":
        return "Approved";
      case "verifying":
        return "Verifying";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="py-6 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/20 transition-colors -mx-2 px-2 sm:mx-0 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-mono text-zinc-400">
              {topup.id.slice(0, 14)}...
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                topup.status
              )}`}
            >
              {getStatusIcon(topup.status)}
              {getStatusText(topup.status)}
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            {formatDate(topup.createdAt)} • {topup.currency}
          </p>
        </div>
        <div className="flex items-center justify-between sm:block text-right">
          <p className="text-xl sm:text-2xl font-bold text-white leading-none">
            ${parseFloat(topup.requestedAmount).toFixed(2)}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold sm:hidden">
            Amount
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Exact Amount Section */}
        <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-yellow-300/70 mb-0.5 uppercase tracking-wider font-semibold">
                Exact Transfer
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-sm font-mono font-bold text-yellow-300 truncate">
                  ${parseFloat(topup.exactAmount).toFixed(4)}
                </p>
                <span className="text-[10px] text-yellow-500/50 hidden sm:inline-block">
                  .{topup.decimalCode}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  parseFloat(topup.exactAmount).toFixed(4),
                  "amount"
                )
              }
              className="p-1.5 rounded-md hover:bg-yellow-500/10 transition-colors shrink-0"
            >
              {copiedAmount ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-yellow-400" />
              )}
            </button>
          </div>
        </div>

        {/* Solana Wallet */}
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">
                Wallet Address
              </p>
              <p className="text-xs font-mono text-zinc-300 truncate">
                {topup.solanaWalletAddress}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(topup.solanaWalletAddress, "wallet")
              }
              className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors shrink-0"
            >
              {copiedWallet ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rejection Reason */}
      {topup.status === "rejected" && topup.rejectionReason && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs text-red-300 font-semibold mb-1">
            Rejection Reason
          </p>
          <p className="text-xs text-red-200/80">{topup.rejectionReason}</p>
        </div>
      )}

      {/* Transaction Hash Submission Form (Pending Only) */}
      {topup.status === "pending" && !topup.transactionHash && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Action Required
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Submit your Solana transaction hash below to verify the liquidity
              proof.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value.trim())}
                placeholder="Enter Solana transaction hash..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/5"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleSubmitTxHash}
                disabled={isSubmitting || !txHash || txHash.length < 20}
                className="w-full sm:w-auto shrink-0 rounded-full bg-gradient-to-r from-violet-900 to-pink-700 hover:from-violet-800 hover:to-pink-600 px-6 h-10 sm:h-auto text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-purple-900/20 border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Submit Proof"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {topup.status === "pending" && topup.transactionHash && (
        <div className="mt-3 text-xs text-yellow-400">
          ⏳ Proof submitted. Validating via ZK circuits...
        </div>
      )}
      {topup.status === "verifying" && (
        <div className="mt-3 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
          <div className="flex items-start gap-2">
            <Loader2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-purple-300 mb-1">
                Verifying Proof
              </p>
              <p className="text-xs text-purple-200/70">
                Your interaction proof is being verified by distributed
                verifiers. This usually takes up to 24 hours.
              </p>
              {topup.transactionHash && (
                <a
                  href={`https://solscan.io/tx/${topup.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2"
                >
                  View on Solscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {topup.status === "approved" && (
        <div className="mt-3 text-xs text-blue-400">
          ✓ Approved! Processing balance update...
        </div>
      )}
      {topup.status === "completed" && topup.completedAt && (
        <div className="mt-3 text-xs text-green-400">
          ✓ Completed on {formatDate(topup.completedAt)}
        </div>
      )}
    </div>
  );
}
