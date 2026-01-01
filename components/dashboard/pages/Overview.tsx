"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Wallet,
  Shield,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Permission Overview
          </h1>
          <p className="text-zinc-500">
            Manage your authorization proofs and spending limits.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors text-white">
            <Activity className="h-4 w-4" />
            Analytics
          </button>
          <Button size="sm">Create New Intent</Button>
        </div>
      </div>

      {/* Alert / Status Banner */}
      <div className="flex items-start gap-4 rounded-xl border border-blue-900/30 bg-blue-900/10 p-4 md:items-center">
        <div className="rounded-full bg-blue-900/20 p-2 text-blue-400">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-400">
            Zero-Knowledge Mode Active
          </h3>
          <p className="text-sm text-blue-200/60 mt-0.5">
            You are interacting without disclosing your primary identity. All
            spending is validated via ZK-Proofs.
          </p>
        </div>
        <button className="whitespace-nowrap rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300">
          View Specs &rarr;
        </button>
      </div>

      {/* Total Value / Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Stat Card - Spendable Capacity */}
        <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-zinc-400">
                Total Spendable Capacity
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white tracking-tight">
              $ 12,450.00
            </span>
            <span className="text-zinc-500 ml-2">USDC</span>
          </div>

          {/* Mini Stats inside card */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Daily Limit Used</p>
              <p className="text-sm font-semibold text-zinc-300">
                $240 / $1,000
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
                <div className="h-1 w-[24%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Active Intents</p>
              <p className="text-sm font-semibold text-zinc-300">4 Active</p>
            </div>
          </div>
        </div>

        {/* Secondary Stat Card - Trust Score / Security */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-zinc-400">
              Authorization Health
            </span>
            <Shield className="h-4 w-4 text-zinc-500" />
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative flex items-center justify-center mb-4">
              <svg
                className="h-32 w-32 -rotate-90 text-zinc-800"
                viewBox="0 0 36 36"
              >
                <path
                  className="stroke-current"
                  fill="none"
                  strokeWidth="3"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  strokeDasharray="98, 100"
                  fill="none"
                  strokeWidth="3"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white">98</span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Score
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500">
              Your authorization logic is robust and verified secure.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Intents Tab Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-200">Active Permissions</h3>
          <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
            View All
          </button>
        </div>
        <div className="divide-y divide-zinc-800">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  {i === 0 ? (
                    <span className="text-xl">✈️</span>
                  ) : i === 1 ? (
                    <span className="text-xl">☁️</span>
                  ) : (
                    <span className="text-xl">🤖</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {i === 0
                      ? "Travel Expenses Policy"
                      : i === 1
                      ? "AWS Infrastructure"
                      : "AI Agent #042"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Expires in {12 - i} days •{" "}
                    {i === 0 ? "Personal" : "Organization"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-300">
                  $ {i === 0 ? "500.00" : i === 1 ? "2,000.00" : "50.00"}
                </p>
                <p className="text-xs text-zinc-500">Monthly Limit</p>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State / Add New */}
        <div className="p-4 bg-zinc-900 text-center">
          <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
            View 12 archived permissions
          </button>
        </div>
      </div>
    </div>
  );
}
