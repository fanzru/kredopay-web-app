"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Scan,
  RefreshCw,
  Plus,
  Wallet,
  LogOut,
  Loader2,
} from "lucide-react";

// Hooks
import { useVirtualCards } from "../hooks/useVirtualCards";
import { useToast } from "@/components/ui/Toast";

// Components
import { VirtualCardItem } from "../components/VirtualCardItem";
import { CompactActionButton } from "../components/CompactActionButton";
import { StatusBanner } from "../components/StatusBanner";
import { TransactionItem } from "../components/TransactionItem";
import { Button } from "@/components/ui/Button";

export function Overview() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    cards,
    transactions,
    isLoading,
    isAuthenticated,
    createCard,
    updateCard,
    deleteCard,
    freezeCard,
    unfreezeCard,
    topUpCard,
    getTotalBalance,
  } = useVirtualCards();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCard = async () => {
    if (!newCardName.trim()) {
      showToast("warning", "Please enter a card name");
      return;
    }

    try {
      setIsCreating(true);
      const limit = spendingLimit ? parseFloat(spendingLimit) : undefined;
      await createCard(newCardName, limit);
      setNewCardName("");
      setSpendingLimit("");
      setShowCreateModal(false);
      showToast("success", "Card created successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create card"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleTopUp = () => {
    showToast("info", "Top-up feature coming soon! 🚀");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <LogOut className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Not Authenticated
          </h2>
          <p className="text-zinc-400 mb-6">
            Please login to access your dashboard.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  const totalBalance = getTotalBalance();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Balance Header */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold text-white">
              ${totalBalance.toFixed(2)}
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              {cards.length} {cards.length === 1 ? "card" : "cards"} active
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTopUp}
              className="relative"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Top Up
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500 text-black rounded-full">
                SOON
              </span>
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Card
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: Actions, Banner, Cards */}
        <div className="lg:col-span-2 space-y-10">
          {/* Action Grid */}
          <div className="grid grid-cols-4 gap-4">
            <CompactActionButton
              icon={ArrowUpRight}
              label="Send"
              onClick={() => showToast("info", "Send feature coming soon!")}
            />
            <CompactActionButton
              icon={RefreshCw}
              label="Swap"
              onClick={() => showToast("info", "Swap feature coming soon!")}
            />
            <CompactActionButton
              icon={ArrowDownLeft}
              label="Receive"
              onClick={() => showToast("info", "Receive feature coming soon!")}
            />
            <CompactActionButton
              icon={Scan}
              label="Pay"
              onClick={() => showToast("info", "Pay feature coming soon!")}
            />
          </div>

          {/* Status Banner */}
          <StatusBanner />

          {/* Virtual Cards */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Virtual Cards</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <Plus size={16} /> New Card
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-16 text-center">
                <Wallet className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">No virtual cards yet</p>
                <p className="text-sm text-zinc-600 mb-6">
                  Create your first virtual card to get started
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {cards.map((card) => (
                  <VirtualCardItem
                    key={card.id}
                    card={card}
                    onUpdate={updateCard}
                    onDelete={deleteCard}
                    onFreeze={freezeCard}
                    onUnfreeze={unfreezeCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Recent Activity
            </h3>
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
                <p className="text-sm text-zinc-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {transactions.slice(0, 10).map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => !isCreating && setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">
                Create Virtual Card
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    Card Name
                  </label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="e.g., Shopping Card"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                    disabled={isCreating}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    Spending Limit (Optional)
                  </label>
                  <input
                    type="number"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                    disabled={isCreating}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCard}
                    disabled={isCreating || !newCardName.trim()}
                    className="flex-1"
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
