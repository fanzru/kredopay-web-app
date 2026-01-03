"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function StakingPromoBanner() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={() => router.push("/dashboard/staking")}
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 group cursor-pointer hover:border-zinc-700 transition-all"
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left Content */}
        <div className="space-y-3 flex-1">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Stake $KREDO
              </h3>
              <p className="text-xs text-zinc-500">Earn up to 45% APR</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 max-w-md">
            Lock your tokens to unlock premium benefits and earn passive
            rewards.
          </p>

          {/* Key Points */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>4 Tiers Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Flexible Lock Periods</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Fee Discounts</span>
            </div>
          </div>
        </div>

        {/* Right Content - CTA */}
        <button className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all">
          <span>Start Staking</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
