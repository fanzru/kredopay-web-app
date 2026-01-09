import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Wallet,
  Loader2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Link2,
  Moon,
  CheckCircle2,
  DollarSign,
  MapPin,
  FileText,
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

interface InternalTopupRequest {
  id: string;
  userEmail: string;
  requestedAmount: string;
  exactAmount: string; // e.g., "20.1024"
  decimalCode: string; // e.g., "1024"
  currency: string;
  userWalletAddress: string;
  solanaWalletAddress: string; // Kredo's Solana wallet
  topupMethod: "wallet_address" | "moonpay";
  status: "pending" | "approved" | "rejected" | "completed";
  cardId: string | null;
  createdAt: number;
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

  // Method selection: 'deposit', 'internal', 'moonpay'
  const [topupMethod, setTopupMethod] = useState<
    "deposit" | "internal" | "moonpay"
  >("deposit");
  const [amount, setAmount] = useState("");
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [depositRequest, setDepositRequest] = useState<DepositRequest | null>(
    null
  );
  const [internalTopupRequest, setInternalTopupRequest] =
    useState<InternalTopupRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedExactAmount, setCopiedExactAmount] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTopupMethod("deposit");
      setAmount("");
      setUserWalletAddress("");
      setSelectedCardId(null);
      setDepositRequest(null);
      setInternalTopupRequest(null);
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

  const handleCreateInternalTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 1) {
      showToast("warning", "Minimum top-up amount is $1");
      return;
    }

    if (!userWalletAddress || userWalletAddress.length < 10) {
      showToast("warning", "Please enter a valid wallet address");
      return;
    }

    try {
      setIsCreating(true);
      const userEmail = localStorage.getItem("kredo_user_email");
      const token = localStorage.getItem("kredo_auth_token");

      const response = await fetch("/api/internal-topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Email": userEmail || "",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          userWalletAddress: userWalletAddress,
          cardId: selectedCardId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create top-up request");
      }

      const data = await response.json();
      setInternalTopupRequest(data.topup);
      showToast(
        "success",
        "Top-up request created! Transfer the exact amount shown below."
      );
      if (onDepositCreated) {
        onDepositCreated();
      }
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create top-up request"
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
                  Choose your preferred top-up method
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
              {!depositRequest && !internalTopupRequest ? (
                // Step 1: Create Request (Deposit or Internal)
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Method Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-3">
                      Top-Up Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* <button
                        onClick={() => setTopupMethod("deposit")}
                        className={`p-4 rounded-lg border transition-all ${
                          topupMethod === "deposit"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="text-2xl mb-2">💳</div>
                        <div className="text-sm font-semibold text-white">
                          Deposit Code
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Existing method
                        </div>
                      </button> */}

                      <button
                        onClick={() => setTopupMethod("internal")}
                        className={`p-3 sm:p-4 rounded-lg border transition-all ${
                          topupMethod === "internal"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
                        }`}
                      >
                        <Link2 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-400" />
                        <div className="text-xs sm:text-sm font-semibold text-white">
                          Wallet Top-Up
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-400 mt-1">
                          Manual approval
                        </div>
                      </button>

                      <button
                        onClick={() => setTopupMethod("moonpay")}
                        className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all relative opacity-50"
                        disabled
                      >
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                        <div className="text-2xl mb-2">🌙</div>
                        <div className="text-xs sm:text-sm font-semibold text-white">
                          MoonPay
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-400 mt-1">
                          Coming soon
                        </div>
                      </button>
                    </div>
                  </div>

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

                  {/* Card Selection (Required for Internal) */}
                  {cards.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-2">
                        Credit to Card{" "}
                        {topupMethod === "internal" && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      <select
                        value={selectedCardId || ""}
                        onChange={(e) =>
                          setSelectedCardId(e.target.value || null)
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                      >
                        <option value="">
                          {topupMethod === "internal"
                            ? "Select a card..."
                            : "All Cards (Distribute evenly)"}
                        </option>
                        {cards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} - Balance: ${card.balance.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {topupMethod === "internal" && !selectedCardId && (
                        <p className="text-xs text-red-400 mt-1.5">
                          Please select a card to receive the top-up
                        </p>
                      )}
                    </div>
                  )}

                  {/* Wallet Address Input (Internal Top-Up Only) */}
                  {topupMethod === "internal" && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-2">
                        Your Wallet Address{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={userWalletAddress}
                        onChange={(e) => setUserWalletAddress(e.target.value)}
                        placeholder="Your Solana wallet address..."
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                      />
                      <p className="text-xs text-zinc-500 mt-1.5">
                        Enter your wallet address for reference
                      </p>
                    </div>
                  )}

                  {/* MoonPay Coming Soon */}
                  {topupMethod === "moonpay" && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 sm:p-6 text-center">
                      <Moon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-yellow-400" />
                      <h4 className="text-base sm:text-lg font-semibold text-yellow-300 mb-2">
                        MoonPay Integration Coming Soon!
                      </h4>
                      <p className="text-xs sm:text-sm text-yellow-200/80 mb-4">
                        We're working on integrating MoonPay for instant top-ups
                        with credit/debit cards.
                      </p>
                      <p className="text-[10px] sm:text-xs text-yellow-200/60">
                        For now, please use Deposit Code or Wallet Top-Up
                        methods.
                      </p>
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
                      onClick={
                        topupMethod === "deposit"
                          ? handleCreateDeposit
                          : handleCreateInternalTopup
                      }
                      disabled={
                        isCreating ||
                        !amount ||
                        parseFloat(amount) < 1 ||
                        (topupMethod === "internal" &&
                          (!userWalletAddress ||
                            userWalletAddress.length < 10 ||
                            !selectedCardId))
                      }
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
                          {topupMethod === "deposit"
                            ? "Generate Deposit Code"
                            : "Create Top-Up Request"}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : depositRequest ? (
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
              ) : internalTopupRequest ? (
                // Step 3: Show Internal Top-Up Instructions
                <motion.div
                  key="internal-instructions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Success Header */}
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-green-400" />
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Top-Up Request Created!
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Transfer the exact amount below to complete your top-up
                    </p>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-black/50 p-5">
                      {/* Request ID */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                        <span className="text-xs text-zinc-500">
                          Request ID
                        </span>
                        <span className="text-sm font-mono text-zinc-300">
                          {internalTopupRequest.id}
                        </span>
                      </div>

                      {/* Exact Amount - Highlighted */}
                      <div className="mb-4 p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-4 w-4 text-yellow-400" />
                              <h4 className="text-xs sm:text-sm font-semibold text-yellow-300">
                                Transfer EXACTLY This Amount
                              </h4>
                            </div>
                            <p className="text-[10px] sm:text-xs text-yellow-200/70">
                              The decimal .{internalTopupRequest.decimalCode} is
                              your unique verification code
                            </p>
                          </div>
                          <div className="w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-end gap-2">
                              <span className="text-2xl sm:text-3xl font-bold text-yellow-300">
                                $
                                {parseFloat(
                                  internalTopupRequest.exactAmount
                                ).toFixed(4)}
                              </span>
                              <button
                                onClick={() => {
                                  copyToClipboard(
                                    parseFloat(
                                      internalTopupRequest.exactAmount
                                    ).toFixed(4),
                                    "code"
                                  );
                                }}
                                className="p-2 rounded border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                              >
                                {copiedCode ? (
                                  <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Copy className="h-4 w-4 text-yellow-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Solana Wallet Address */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-3 w-3 text-zinc-500" />
                          <label className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                            Send to Kredo Solana Wallet
                          </label>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1 rounded-lg border border-zinc-800 bg-black/30 px-3 sm:px-4 py-2 sm:py-3 font-mono text-[10px] sm:text-xs text-white break-all">
                            {internalTopupRequest.solanaWalletAddress}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                internalTopupRequest.solanaWalletAddress,
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
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-zinc-400" />
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-300">
                          Transfer Instructions
                        </h4>
                      </div>
                      <ol className="space-y-2 text-xs sm:text-sm text-zinc-400">
                        <li className="flex gap-2 sm:gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            1.
                          </span>
                          <span>
                            Transfer exactly{" "}
                            <strong className="text-white">
                              $
                              {parseFloat(
                                internalTopupRequest.exactAmount
                              ).toFixed(4)}
                            </strong>{" "}
                            to the Solana wallet above
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            2.
                          </span>
                          <span>
                            The decimal code{" "}
                            <strong className="text-white font-mono">
                              .{internalTopupRequest.decimalCode}
                            </strong>{" "}
                            helps us identify your transfer
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            3.
                          </span>
                          <span>
                            Wait for admin verification (usually within 24
                            hours)
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-zinc-300 shrink-0">
                            4.
                          </span>
                          <span>
                            Your balance will be updated to{" "}
                            <strong className="text-white">
                              $
                              {parseFloat(
                                internalTopupRequest.requestedAmount
                              ).toFixed(2)}
                            </strong>{" "}
                            once approved
                          </span>
                        </li>
                      </ol>
                    </div>

                    {/* Transaction Hash Submission Form */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-300 mb-1">
                            Submit Transaction Hash
                          </p>
                          <p className="text-xs text-blue-200/70">
                            After transferring the exact amount, submit your
                            Solana transaction hash to verify the transfer.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value.trim())}
                          placeholder="Enter Solana transaction hash..."
                          className="flex-1 rounded-lg border border-zinc-700 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:bg-black focus:ring-1 focus:ring-blue-500"
                          disabled={isSubmittingTx}
                        />
                        <Button
                          onClick={async () => {
                            if (!txHash || txHash.length < 20) {
                              showToast(
                                "warning",
                                "Please enter a valid transaction hash"
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
                                `/api/internal-topup/${internalTopupRequest.id}`,
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
                              setInternalTopupRequest(data.topup);
                              setTxHash("");
                              showToast(
                                "success",
                                "Transaction hash submitted! Waiting for verification."
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
                            isSubmittingTx || !txHash || txHash.length < 20
                          }
                          size="sm"
                        >
                          {isSubmittingTx ? (
                            <>
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Status Info */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-300 mb-1">
                            What's Next?
                          </p>
                          <p className="text-xs text-zinc-400">
                            You can submit your transaction hash now or later
                            from the dashboard. Your request will be verified
                            within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInternalTopupRequest(null);
                          setAmount("");
                          setUserWalletAddress("");
                        }}
                        className="flex-1"
                      >
                        New Request
                      </Button>
                      <Button onClick={onClose} className="flex-1">
                        Done
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
