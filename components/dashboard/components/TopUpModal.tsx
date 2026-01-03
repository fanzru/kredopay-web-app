import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Wallet,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useVirtualCards } from "../hooks/useVirtualCards";

interface DepositRequest {
  id: string;
  userEmail: string;
  requestedAmount?: string;
  exactAmount?: string;
  amount: string; // For backward compatibility
  currency: string;
  uniqueCode: string;
  walletAddress: string;
  status: "pending" | "completed" | "failed" | "expired";
  cardId: string | null;
  createdAt: number;
  expiresAt: number;
  completedAt: number | null;
  transactionHash: string | null;
  decimalCode?: string; // The 3-digit decimal code
}

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositCreated?: () => void;
}

export function TopUpModal({
  isOpen,
  onClose,
  onDepositCreated,
}: TopUpModalProps) {
  const { showToast } = useToast();
  const { cards, getTotalBalance } = useVirtualCards();

  const [amount, setAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [depositRequest, setDepositRequest] = useState<DepositRequest | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedExactAmount, setCopiedExactAmount] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setSelectedCardId(null);
      setDepositRequest(null);
      setCopiedCode(false);
      setCopiedAddress(false);
      setCopiedExactAmount(false);
      setTxHash("");
    }
  }, [isOpen]);

  // Poll for deposit status if pending
  useEffect(() => {
    if (!depositRequest || depositRequest.status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        setIsCheckingStatus(true);
        const userEmail = localStorage.getItem("kredo_user_email");
        const token = localStorage.getItem("kredo_auth_token");

        const response = await fetch(`/api/deposits/${depositRequest.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Email": userEmail || "",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const updated = data.deposit;
          setDepositRequest(updated);

          if (updated.status === "completed") {
            showToast(
              "success",
              "Deposit completed! Your balance has been updated."
            );
            // Refresh cards to show updated balance
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else if (
            updated.status === "failed" ||
            updated.status === "expired"
          ) {
            showToast(
              "error",
              `Deposit ${updated.status}. Please create a new deposit request.`
            );
          }
        }
      } catch (err) {
        console.error("Error checking deposit status:", err);
      } finally {
        setIsCheckingStatus(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [depositRequest, showToast]);

  const handleCreateDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 1) {
      showToast("warning", "Minimum deposit amount is $1");
      return;
    }

    try {
      setIsCreating(true);
      const userEmail = localStorage.getItem("kredo_user_email");
      const token = localStorage.getItem("kredo_auth_token");

      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Email": userEmail || "",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          cardId: selectedCardId || null,
          currency: "USDC",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create deposit request");
      }

      const data = await response.json();
      setDepositRequest(data.deposit);
      showToast(
        "success",
        "Deposit request created! Follow the instructions below."
      );
      // Notify parent to refresh deposits list
      if (onDepositCreated) {
        onDepositCreated();
      }
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create deposit request"
      );
    } finally {
      setIsCreating(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "failed":
      case "expired":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>
        <div
          className="absolute inset-0"
          onClick={() => !isCreating && !depositRequest && onClose()}
        />
      </div>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl my-8 pointer-events-auto"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Top Up Balance
                </h3>
                <p className="text-sm text-zinc-400">
                  Generate a unique deposit code and transfer funds
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                disabled={isCreating}
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!depositRequest ? (
                // Step 1: Create Deposit Request
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Deposit Amount <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
                        $
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (!isNaN(parseFloat(value)) &&
                              parseFloat(value) >= 0)
                          ) {
                            setAmount(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="100.00"
                        min="1"
                        step="0.01"
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 pl-10 pr-4 py-3 text-lg text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Minimum: $1 | Maximum: $100,000
                    </p>
                  </div>

                  {/* Card Selection (Optional) */}
                  {cards.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-2">
                        Credit to Card (Optional)
                      </label>
                      <select
                        value={selectedCardId || ""}
                        onChange={(e) =>
                          setSelectedCardId(e.target.value || null)
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                      >
                        <option value="">All Cards (Distribute evenly)</option>
                        {cards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} - Balance: ${card.balance.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Info Banner */}
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-300">
                          How it works
                        </p>
                        <ul className="text-xs text-blue-200/80 space-y-1 list-disc list-inside">
                          <li>We'll generate a unique deposit code for you</li>
                          <li>
                            Transfer the exact amount to our wallet address
                          </li>
                          <li>
                            Include the deposit code in the transaction memo
                          </li>
                          <li>Your balance will be updated automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isCreating}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateDeposit}
                      disabled={isCreating || !amount || parseFloat(amount) < 1}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Generate Deposit Code
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Step 2: Show Deposit Instructions
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                      depositRequest.status
                    )}`}
                  >
                    {isCheckingStatus &&
                      depositRequest.status === "pending" && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    <span className="text-sm font-semibold">
                      Status: {getStatusText(depositRequest.status)}
                    </span>
                  </div>

                  {/* Deposit Details */}
                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-black/50 p-5">
                      {/* Requested Amount */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-zinc-300">
                          Requested Amount
                        </h4>
                        <span className="text-lg font-semibold text-zinc-400">
                          $
                          {parseFloat(
                            depositRequest.requestedAmount ||
                              depositRequest.amount
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Exact Amount with Decimal Code */}
                      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-300 mb-1">
                            Exact Amount to Transfer
                          </h4>
                          <p className="text-xs text-yellow-200/70">
                            Transfer this exact amount (includes unique code)
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-yellow-300">
                              $
                              {parseFloat(
                                depositRequest.exactAmount ||
                                  depositRequest.amount
                              ).toFixed(3)}
                            </span>
                            <button
                              onClick={() => {
                                const exactAmount =
                                  depositRequest.exactAmount ||
                                  depositRequest.amount;
                                copyToClipboard(
                                  parseFloat(exactAmount).toFixed(3),
                                  "code"
                                );
                                setCopiedExactAmount(true);
                                setTimeout(
                                  () => setCopiedExactAmount(false),
                                  2000
                                );
                              }}
                              className="p-1.5 rounded border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                            >
                              {copiedExactAmount ? (
                                <Check className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-yellow-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Unique Code */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
                          Unique Deposit Code
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-4 py-3 font-mono text-sm text-white break-all">
                            {depositRequest.uniqueCode}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(depositRequest.uniqueCode, "code")
                            }
                            className="p-2 rounded-lg border border-zinc-800 bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            {copiedCode ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-zinc-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Include this code in your transaction memo
                        </p>
                      </div>

                      {/* Wallet Address */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
                          Kredo Wallet Address
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-4 py-3 font-mono text-xs text-white break-all">
                            {depositRequest.walletAddress}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                depositRequest.walletAddress,
                                "address"
                              )
                            }
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
                    </div>

                    {/* Instructions */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                      <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                        Transfer Instructions
                      </h4>
                      <ol className="space-y-2 text-sm text-zinc-400">
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            1.
                          </span>
                          <span>
                            Send exactly{" "}
                            <strong className="text-white">
                              $
                              {parseFloat(
                                depositRequest.exactAmount ||
                                  depositRequest.amount
                              ).toFixed(3)}
                            </strong>{" "}
                            to the wallet address above
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            2.
                          </span>
                          <span>
                            Include the deposit code{" "}
                            <strong className="text-white font-mono">
                              {depositRequest.uniqueCode}
                            </strong>{" "}
                            in the transaction memo/note
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            3.
                          </span>
                          <span>
                            Wait for confirmation (usually 1-5 minutes)
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            4.
                          </span>
                          <span>
                            Your balance will be updated automatically once
                            verified
                          </span>
                        </li>
                      </ol>
                    </div>

                    {/* Transaction Hash Submission Form */}
                    {depositRequest.status === "pending" &&
                      !depositRequest.transactionHash && (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-300 mb-1">
                                Submit Transaction Hash
                              </h4>
                              <p className="text-xs text-blue-200/70">
                                After transferring the exact amount, submit your
                                transaction hash to verify the deposit.
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">
                              Transaction Hash
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={txHash}
                                onChange={(e) =>
                                  setTxHash(e.target.value.trim())
                                }
                                placeholder="0x..."
                                className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-4 py-2.5 font-mono text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                                disabled={isSubmittingTx}
                              />
                              <Button
                                onClick={async () => {
                                  if (!txHash || !txHash.startsWith("0x")) {
                                    showToast(
                                      "warning",
                                      "Please enter a valid transaction hash (starts with 0x)"
                                    );
                                    return;
                                  }

                                  try {
                                    setIsSubmittingTx(true);
                                    const userEmail =
                                      localStorage.getItem("kredo_user_email");
                                    const token =
                                      localStorage.getItem("kredo_auth_token");

                                    const response = await fetch(
                                      `/api/deposits/${depositRequest.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                          "X-User-Email": userEmail || "",
                                        },
                                        body: JSON.stringify({
                                          transactionHash: txHash,
                                        }),
                                      }
                                    );

                                    if (!response.ok) {
                                      const error = await response.json();
                                      throw new Error(
                                        error.error ||
                                          "Failed to submit transaction hash"
                                      );
                                    }

                                    const data = await response.json();
                                    setDepositRequest(data.deposit);
                                    setTxHash("");
                                    showToast(
                                      "success",
                                      "Transaction hash submitted! We'll verify your deposit shortly."
                                    );
                                    if (onDepositCreated) {
                                      onDepositCreated();
                                    }
                                  } catch (err) {
                                    showToast(
                                      "error",
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to submit transaction hash"
                                    );
                                  } finally {
                                    setIsSubmittingTx(false);
                                  }
                                }}
                                disabled={
                                  isSubmittingTx ||
                                  !txHash ||
                                  !txHash.startsWith("0x")
                                }
                                className="shrink-0"
                              >
                                {isSubmittingTx ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit"
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1.5">
                              Enter the transaction hash from your wallet after
                              completing the transfer
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Status Message - Transaction Submitted */}
                    {depositRequest.status === "pending" &&
                      depositRequest.transactionHash && (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200/80">
                              Transaction hash submitted. We're verifying your
                              deposit. This usually takes 1-5 minutes.
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Expiry Warning */}
                    {depositRequest.status === "pending" && (
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-300 mb-1">
                              Deposit Code Expires
                            </p>
                            <p className="text-xs text-yellow-200/80">
                              This deposit code expires in{" "}
                              {Math.max(
                                0,
                                Math.floor(
                                  (depositRequest.expiresAt - Date.now()) /
                                    (1000 * 60)
                                )
                              )}{" "}
                              minutes. Please complete your transfer before
                              then.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDepositRequest(null);
                          setAmount("");
                        }}
                        className="flex-1"
                      >
                        New Deposit
                      </Button>
                      <Button onClick={onClose} className="flex-1">
                        Done
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
