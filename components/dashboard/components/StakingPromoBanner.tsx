"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { ScrambleText } from "@/components/ui/ScrambleText";

export function StakingPromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black p-5 sm:p-6 group"
    >
      {/* Background Ambience similar to Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-900/0 to-zinc-900/0" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase">
            <Trophy size={14} className="text-yellow-500" />
            <span>KREDO Event</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter leading-none text-white font-sans">
            STAKING IS <br className="sm:hidden" />
            <ScrambleText
              words={[
                "COMING SOON",
                "LOADING...",
                "ALMOST HERE",
                "PREPARING...",
              ]}
              delay={500}
              pauseDuration={2000}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            />
          </h2>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg">
            Get ready to unlock exclusive rewards. The reflexivity layer is
            about to activate. Prepare your assets for the next evolution.
          </p>
        </div>

        {/* Decorative Graphic */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
