"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Static Abstract Pattern
const StaticAbstractPattern = () => {
  return (
    <div className="absolute top-0 right-0 h-full w-1/3 overflow-hidden pointer-events-none">
      {/* Circle 1 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/20 blur-xl" />
      {/* Circle 2 */}
      <div className="absolute top-0 right-10 w-32 h-32 rounded-full bg-blue-500/20 blur-lg" />
      {/* Circle 3 - Solid shape style */}
      <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border-[20px] border-white/5 opacity-50" />
    </div>
  );
};

interface Promotion {
  id: string;
  title: string;
  description: string;
  reward: string;
  route: string;
  buttonText: string;
  tnc?: string;
}

export function PromotionBanner() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const promotions: Promotion[] = [
    {
      id: "referral",
      title: "Get $50 Free",
      description: "Invite friends. Limited to first 5 people only.",
      reward: "$50 GIFT",
      route: "/dashboard/referral",
      buttonText: "Invite",
      tnc: "First 5 only",
    },
    {
      id: "staking",
      title: "Earn 45% APR",
      description: "Stake tokens & unlock VIP benefits.",
      reward: "45% APR",
      route: "/dashboard/staking",
      buttonText: "Stake",
    },
  ];

  const currentPromo = promotions[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + promotions.length) % promotions.length
    );
  };

  return (
    <div className="space-y-3">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-center min-h-[160px]">
        {/* Static Background Graphic */}
        <StaticAbstractPattern />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Text Content - Limited width to prevent collision */}
          <div className="space-y-1.5 flex-1 min-w-0 max-w-[65%]">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700 uppercase tracking-wider whitespace-nowrap">
                {currentPromo.reward}
              </div>
              {currentPromo.tnc && (
                <span className="text-[9px] text-zinc-500 hidden sm:inline-block">
                  {currentPromo.tnc}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-white leading-tight truncate">
              {currentPromo.title}
            </h2>

            <p className="text-zinc-500 text-xs leading-snug line-clamp-2">
              {currentPromo.description}
            </p>

            {/* Mobile Only T&C */}
            {currentPromo.tnc && (
              <p className="text-[9px] text-zinc-600 sm:hidden">
                *{currentPromo.tnc}
              </p>
            )}
          </div>

          {/* Compact Button */}
          <button
            onClick={() => router.push(currentPromo.route)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-black text-[10px] font-bold hover:bg-zinc-200 transition-colors whitespace-nowrap"
          >
            {currentPromo.buttonText}
          </button>
        </div>
      </div>

      {/* External Navigation Controls */}
      <div className="flex items-center justify-between px-1">
        {/* Dots */}
        <div className="flex gap-1.5">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${
                  idx === currentIndex
                    ? "w-6 bg-zinc-600"
                    : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
                }
                `}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
