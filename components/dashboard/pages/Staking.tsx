"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Lock,
  Unlock,
  Zap,
  Award,
  DollarSign,
  ArrowRight,
  Info,
  Sparkles,
  Crown,
  Shield,
  Wallet,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useStaking } from "../hooks/useStaking";

// Tier definitions
const STAKING_TIERS = {
  BRONZE: {
    name: "Bronze",
    minStake: 100,
    apr: 5,
    icon: Shield,
    color: "text-orange-400",
    benefits: ["Basic card creation", "Standard fees", "1 virtual card"],
  },
  SILVER: {
    name: "Silver",
    minStake: 1000,
    apr: 10,
    icon: Award,
    color: "text-zinc-400",
    benefits: [
      "Up to 5 virtual cards",
      "20% fee discount",
      "Priority support",
      "Basic analytics",
    ],
  },
  GOLD: {
    name: "Gold",
    minStake: 10000,
    apr: 15,
    icon: Sparkles,
    color: "text-yellow-400",
    benefits: [
      "Unlimited virtual cards",
      "50% fee discount",
      "Advanced analytics",
      "Card sharing (5 people)",
      "Exclusive card skins",
    ],
  },
  PLATINUM: {
    name: "Platinum",
    minStake: 100000,
    apr: 25,
    icon: Crown,
    color: "text-purple-400",
    benefits: [
      "All Gold benefits",
      "80% fee discount",
      "API access",
      "White-label options",
      "Governance voting",
      "Early access features",
    ],
  },
};

const LOCK_PERIODS = [
  { days: 0, label: "Flexible", bonus: 0 },
  { days: 30, label: "30 Days", bonus: 2 },
  { days: 90, label: "90 Days", bonus: 5 },
  { days: 180, label: "180 Days", bonus: 10 },
  { days: 365, label: "365 Days", bonus: 20 },
];

export function StakingPage() {
  const { showToast } = useToast();
  const { data, loading, stake, claimRewards, unstake, refresh } = useStaking();
  const [selectedTier, setSelectedTier] =
    useState<keyof typeof STAKING_TIERS>("SILVER");
  const [stakeAmount, setStakeAmount] = useState("1000");
  const [lockPeriod, setLockPeriod] = useState(0);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  const calculateAPR = (tier: keyof typeof STAKING_TIERS, lockDays: number) => {
    const baseAPR = STAKING_TIERS[tier].apr;
    const lockBonus = LOCK_PERIODS.find((p) => p.days === lockDays)?.bonus || 0;
    return baseAPR + lockBonus;
  };

  const calculateRewards = (
    amount: number,
    apr: number,
    days: number = 365
  ) => {
    return (amount * apr * days) / 365 / 100;
  };

  const handleStake = async () => {
    try {
      setIsStaking(true);
      const amount = parseFloat(stakeAmount);

      if (isNaN(amount) || amount <= 0) {
        showToast("error", "Please enter a valid amount");
        return;
      }

      await stake(amount, lockPeriod);
      showToast("success", `Successfully staked ${amount} $KREDO!`);
      setShowStakeModal(false);
      setStakeAmount("1000");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to stake"
      );
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async (positionId: string) => {
    try {
      const result = await claimRewards(positionId);
      showToast("success", `Claimed ${result.claimed.toFixed(2)} $KREDO!`);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to claim rewards"
      );
    }
  };

  const handleUnstake = async (positionId: string) => {
    try {
      const result = await unstake(positionId);
      const message =
        result.penalty > 0
          ? `Unstaked ${result.returned.toFixed(
              2
            )} $KREDO (${result.penalty.toFixed(2)} penalty)`
          : `Unstaked ${result.returned.toFixed(2)} $KREDO`;
      showToast("success", message);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to unstake"
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Staking
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Stake $KREDO to unlock higher limits and earn rewards.
          </p>
        </div>

        {/* Wallet Balance - Coming Soon */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2">
            <Wallet className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">
              {data?.profile.kredo_balance.toLocaleString() || "0.00"} $KREDO
            </span>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="rounded-xl opacity-50 cursor-not-allowed"
            >
              + Top Up
            </Button>
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              Soon
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview - Compact Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-zinc-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium">Total Staked</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.totalStaked.toLocaleString() || "0"}{" "}
            <span className="text-xs text-zinc-500 font-normal">$KREDO</span>
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Rewards Earned</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.totalRewards.toFixed(2) || "0.00"}{" "}
            <span className="text-xs text-zinc-500 font-normal">$KREDO</span>
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-zinc-400">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Current Status</span>
          </div>
          <p className="text-xl font-bold text-white uppercase tracking-wider">
            {
              STAKING_TIERS[
                (data?.currentTier || "BRONZE") as keyof typeof STAKING_TIERS
              ].name
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content (Calculator) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Calculator Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              Stake Calculator
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-2 block">
                  Amount ($KREDO)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive numbers
                    if (
                      value === "" ||
                      (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                    ) {
                      setStakeAmount(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus, plus, and 'e' (scientific notation)
                    if (
                      e.key === "-" ||
                      e.key === "+" ||
                      e.key === "e" ||
                      e.key === "E"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-zinc-700 focus:bg-black focus:ring-1 focus:ring-zinc-700"
                  placeholder="Enter amount..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 mb-2 block">
                  Lock Period
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {LOCK_PERIODS.map((period) => (
                    <button
                      key={period.days}
                      onClick={() => setLockPeriod(period.days)}
                      className={`px-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        lockPeriod === period.days
                          ? "border-white bg-white text-black"
                          : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {period.label}
                      {period.bonus > 0 && (
                        <span className="block text-[10px] opacity-70">
                          +{period.bonus}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Strip */}
              <div className="rounded-xl bg-black/40 border border-zinc-800/50 p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Effective APR</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {calculateAPR(selectedTier, lockPeriod)}%
                  </span>
                </div>
                <div className="w-full h-px bg-zinc-800/50" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Monthly Yield</span>
                  <span className="text-white font-mono">
                    {calculateRewards(
                      parseFloat(stakeAmount) || 0,
                      calculateAPR(selectedTier, lockPeriod),
                      30
                    ).toFixed(2)}{" "}
                    $KREDO
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowStakeModal(true)}
                className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 font-bold h-11"
              >
                Stake Now
              </Button>
            </div>
          </div>

          {/* Active Positions List */}
          {data?.positions && data.positions.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Active Stakes</h3>
              </div>
              <div>
                {data.positions.map((position) => (
                  <div
                    key={position.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {position.amount.toLocaleString()} $KREDO
                        </p>
                        <p className="text-xs text-zinc-500">
                          {position.apr}% APR • {position.tier} Tier
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-emerald-400">
                          +{position.total_rewards_earned.toFixed(2)}
                        </p>
                        <p className="text-xs text-zinc-600">Rewards</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnstake(position.id)}
                        className="text-zinc-400 hover:text-white"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Tiers */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-white">Select Tier</h3>
          </div>

          {Object.entries(STAKING_TIERS).map(([key, tier]) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === key;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  setSelectedTier(key as keyof typeof STAKING_TIERS)
                }
                className={`
                  relative rounded-xl border p-4 cursor-pointer transition-all
                  ${
                    isSelected
                      ? "bg-zinc-800/50 border-zinc-700"
                      : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${tier.color}`} />
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {tier.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {tier.apr}% APR
                  </span>
                </div>

                <div className="space-y-1">
                  {tier.benefits.slice(0, 2).map((benefit, i) => (
                    <p key={i} className="text-[10px] text-zinc-500">
                      • {benefit}
                    </p>
                  ))}
                  {tier.benefits.length > 2 && (
                    <p className="text-[10px] text-zinc-600 italic">
                      +{tier.benefits.length - 2} more benefits
                    </p>
                  )}
                </div>

                <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                  Min stake: {tier.minStake.toLocaleString()}
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </motion.div>
            );
          })}

          {/* Info Box */}
          <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4 mt-6">
            <div className="flex gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Staking moves you to higher tiers automatically based on your
                total locked amount. Unlock permissions at Gold tier.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stake Confirmation Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowStakeModal(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Confirm Check</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Amount</span>
                <span className="text-white font-mono">
                  {stakeAmount} $KREDO
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Duration</span>
                <span className="text-white">
                  {LOCK_PERIODS.find((p) => p.days === lockPeriod)?.label}
                </span>
              </div>
              <div className="w-full h-px bg-zinc-800" />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Estimated APR</span>
                <span className="text-emerald-400 font-bold">
                  {calculateAPR(selectedTier, lockPeriod)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStakeModal(false)}
                className="rounded-xl"
                disabled={isStaking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStake}
                className="rounded-xl bg-white text-black hover:bg-zinc-200"
                disabled={isStaking}
              >
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
