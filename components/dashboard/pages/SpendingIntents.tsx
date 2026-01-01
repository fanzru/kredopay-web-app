"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter } from "lucide-react";

export function SpendingIntents() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Spending Intents
          </h1>
          <p className="text-zinc-500">
            Active and pending authorization requests.
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Intent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            placeholder="Search intents..."
          />
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

        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
          >
            <div className="col-span-5 flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  i % 2 === 0
                    ? "bg-purple-900/20 text-purple-500"
                    : "bg-blue-900/20 text-blue-500"
                }`}
              >
                {i % 2 === 0 ? "🛍️" : "💻"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {i % 2 === 0 ? "Merchant Payment" : "SaaS Subscription"}
                </p>
                <p className="text-xs text-zinc-500">Created 2h ago</p>
              </div>
            </div>
            <div className="col-span-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  i === 1
                    ? "bg-yellow-900/30 text-yellow-500"
                    : "bg-emerald-900/30 text-emerald-500"
                }`}
              >
                {i === 1 ? "Pending Proof" : "Authorized"}
              </span>
            </div>
            <div className="col-span-3">
              <p className="text-sm font-medium text-zinc-200">
                $ {i * 150}.00
              </p>
              <p className="text-xs text-zinc-600">USDC</p>
            </div>
            <div className="col-span-1 text-right">
              <button className="text-zinc-500 hover:text-white">•••</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
