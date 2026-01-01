"use client";

import React from "react";
import { Ghost, Info } from "lucide-react";

export function LiquidityFog() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Liquidity Fog <Ghost className="h-5 w-5 text-zinc-600" />
          </h1>
          <p className="text-zinc-500">
            Pooled centralized liquidity where ownership is obfuscated.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-8 text-center relative overflow-hidden">
        {/* Visual Effect Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-zinc-900/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700 backdrop-blur-md">
            <Ghost className="h-10 w-10 text-zinc-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            $ 45,200,941.00
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            Total Value Locked in Fog Pool #1
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Utilization Rate</p>
              <p className="text-lg font-semibold text-emerald-400">42.5%</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Anonymity Set</p>
              <p className="text-lg font-semibold text-blue-400">
                12,405 Users
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">ZK-Proof Throughput</p>
              <p className="text-lg font-semibold text-purple-400">145 TPS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-blue-900/5 border border-blue-900/20 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0" />
        <p className="text-sm text-blue-200/70">
          <strong className="text-blue-300">How Fog Pools Work:</strong> Your
          funds are not held in a personal wallet. They are contributed to this
          shared pool. When you spend, you present a ZK-Proof authorizing the
          withdrawal. The blockchain sees the pool paying the merchant, not you.
        </p>
      </div>
    </div>
  );
}
