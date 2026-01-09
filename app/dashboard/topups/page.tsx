"use client";

import React from "react";
import { History, ShieldCheck } from "lucide-react";
import { useInternalTopups } from "@/components/dashboard/hooks/useInternalTopups";
import { InternalTopupRequestItem } from "@/components/dashboard/components/InternalTopupRequestItem";
import { ProofHistory } from "@/components/dashboard/pages/ProofHistory";

export default function TopupsPage() {
  const {
    topups,
    isLoading: topupsLoading,
    refreshTopups,
  } = useInternalTopups();

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 sm:pb-20 px-4 sm:px-6">
      {/* Pending Authorizations Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Liquidity Authorization History
          </h1>
          <p className="text-sm text-zinc-400">
            Track your liquidity authorization requests and proof generation
            status.
          </p>
        </div>

        {/* Internal Top-Up Requests */}
        {topups.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Active Authorizations ({topups.length})
                </h3>
              </div>
              <button
                onClick={refreshTopups}
                className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-transparent hover:border-zinc-800 transition-all"
                disabled={topupsLoading}
              >
                <History size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            <div className="">
              {topups.map((topup) => (
                <InternalTopupRequestItem
                  key={topup.id}
                  topup={topup}
                  onRefresh={refreshTopups}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Active Authorizations
            </h3>
            <p className="text-sm text-zinc-400">
              Your liquidity authorization requests will appear here
            </p>
          </div>
        )}
      </div>

      {/* Proof History Section (Merged) */}
      <div className="pt-8 border-t border-zinc-800/50">
        <ProofHistory />
      </div>
    </div>
  );
}
