"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Search,
  Filter,
  ShoppingBag,
  Laptop,
  MoreHorizontal,
  Loader2,
  LogOut,
  X,
} from "lucide-react";
import { useSpendingIntentsAuth } from "../hooks/useSpendingIntentsAuth";

export function SpendingIntents() {
  const router = useRouter();
  const {
    intents,
    isLoading,
    error,
    isAuthenticated,
    searchQuery,
    setSearchQuery,
    createIntent,
    cancelIntent,
    getRelativeTime,
  } = useSpendingIntentsAuth();

  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateIntent = async () => {
    try {
      setIsCreating(true);
      // In real implementation, this would open a modal
      await createIntent(
        "merchant_payment",
        100,
        "Test Payment",
        "Test Merchant"
      );
      showToast("success", "Intent created successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create intent"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelIntent = async (intentId: string) => {
    try {
      await cancelIntent(intentId);
      showToast("success", "Intent cancelled successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to cancel intent"
      );
    }
  };

  const getIntentIcon = (type: string) => {
    switch (type) {
      case "merchant_payment":
        return <ShoppingBag size={14} />;
      case "saas_subscription":
      case "contract_interaction":
        return <Laptop size={14} />;
      default:
        return <ShoppingBag size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_proof":
        return "bg-yellow-900/30 text-yellow-500";
      case "authorized":
        return "bg-emerald-900/30 text-emerald-500";
      case "executed":
        return "bg-blue-900/30 text-blue-500";
      case "rejected":
        return "bg-red-900/30 text-red-500";
      default:
        return "bg-zinc-900/30 text-zinc-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_proof":
        return "Pending Proof";
      case "authorized":
        return "Authorized";
      case "executed":
        return "Executed";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
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
            Please login to view spending intents.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Spending Intents
          </h1>
          <p className="text-zinc-500">
            Active and pending authorization requests.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleCreateIntent}
          disabled={isCreating || isLoading}
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Intent
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            placeholder="Search intents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Intent List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 px-6 py-3 text-xs font-medium uppercase text-zinc-500">
          <div className="col-span-5">Intent Details</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-zinc-800/50"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-800/50 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="h-6 w-24 bg-zinc-800/50 rounded-full animate-pulse"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1"></div>
            </div>
          ))
        ) : intents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">
              {searchQuery
                ? "No intents found matching your search"
                : "No spending intents yet"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Create your first spending intent to get started
            </p>
          </div>
        ) : (
          intents.map((intent) => (
            <div
              key={intent.id}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    intent.type === "merchant_payment"
                      ? "bg-purple-900/20 text-purple-500"
                      : "bg-blue-900/20 text-blue-500"
                  }`}
                >
                  {getIntentIcon(intent.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {intent.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {intent.merchant && `${intent.merchant} • `}
                    Created {getRelativeTime(intent.createdAt)}
                  </p>
                </div>
              </div>
              <div className="col-span-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    intent.status
                  )}`}
                >
                  {getStatusLabel(intent.status)}
                </span>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-medium text-zinc-200">
                  $ {intent.amount.toLocaleString()}.00
                </p>
                <p className="text-xs text-zinc-600">{intent.currency}</p>
              </div>
              <div className="col-span-1 text-right">
                <button
                  className="text-zinc-500 hover:text-white"
                  onClick={() => handleCancelIntent(intent.id)}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
