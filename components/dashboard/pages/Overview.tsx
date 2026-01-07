"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Scan,
  RefreshCw,
  Plus,
  Wallet,
  LogOut,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";

// Hooks
import { useVirtualCards } from "../hooks/useVirtualCards";
import { useDeposits } from "../hooks/useDeposits";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

// Components
import { VirtualCardItem } from "../components/VirtualCardItem";
import { CompactActionButton } from "../components/CompactActionButton";
import { StatusBanner } from "../components/StatusBanner";
import { TransactionItem } from "../components/TransactionItem";
import { CreateCardModal } from "../components/CreateCardModal";
import { StakingPromoBanner } from "../components/StakingPromoBanner";
import { PromotionBanner } from "../components/PromotionBanner";
import { TopUpModal } from "../components/TopUpModal";
import { DepositRequestItem } from "../components/DepositRequestItem";

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

  const {
    deposits,
    isLoading: depositsLoading,
    refreshDeposits,
  } = useDeposits();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const handleTopUp = () => {
    setShowTopUpModal(true);
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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-24 sm:pb-20 px-4 sm:px-6">
      {/* Balance Header */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Total Balance</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              ${totalBalance.toFixed(2)}
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              {cards.length} {cards.length === 1 ? "card" : "cards"} active
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 sm:flex-initial w-full opacity-50 cursor-not-allowed h-9 sm:h-10 px-0 sm:px-6"
              >
                <Wallet className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs">Top Up</span>
              </Button>
              <span className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-2 bg-white text-black text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10">
                Soon
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial h-9 sm:h-10 px-0 sm:px-6"
            >
              <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs">New Card</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        {/* LEFT COLUMN: Actions, Banner, Cards */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-10">
          {/* Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <CompactActionButton
              icon={ArrowUpRight}
              label="Send"
              onClick={() => router.push("/dashboard/send")}
            />
            <CompactActionButton
              icon={RefreshCw}
              label="Swap"
              onClick={() => router.push("/dashboard/swap")}
            />
            <CompactActionButton
              icon={Scan}
              label="Pay"
              onClick={() => router.push("/dashboard/pay")}
            />
          </div>

          {/* Promotion Banner */}
          <PromotionBanner />

          {/* Status Banner */}
          <StatusBanner />

          {/* Deposit Requests */}
          {deposits.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Deposit Requests
                </h3>
                <button
                  onClick={refreshDeposits}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                  disabled={depositsLoading}
                >
                  <History size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
              <div className="space-y-3">
                {deposits.slice(0, 5).map((deposit) => (
                  <DepositRequestItem
                    key={deposit.id}
                    deposit={deposit}
                    onRefresh={refreshDeposits}
                  />
                ))}
                {deposits.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-zinc-500">
                      Showing 5 of {deposits.length} deposits
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Virtual Cards */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Virtual Cards
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <Plus size={16} />{" "}
                <span className="hidden sm:inline">New Card</span>
              </button>
            </div>

            {/* Info Banner */}
            {cards.length > 0 && (
              <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex items-start gap-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 bg-blue-500/10 rounded-full shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="relative space-y-1">
                  <h4 className="text-sm font-semibold text-blue-100">
                    Activation Pending
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                    This card remains inactive until you top up and submit your
                    card number.
                  </p>
                </div>
              </div>
            )}

            {cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 sm:p-16 text-center">
                <Wallet className="h-12 w-12 sm:h-16 sm:w-16 text-zinc-600 mx-auto mb-4" />
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
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
          <div className="lg:sticky lg:top-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">
              Recent Activity
            </h3>
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 text-center">
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

      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCard={async (name: string, limit?: number) => {
          await createCard(name, limit);
        }}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onDepositCreated={refreshDeposits}
      />
    </div>
  );
}
