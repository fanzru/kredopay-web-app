"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ghost, Droplets, Users, Zap, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLiquidityFogAuth } from "../hooks/useLiquidityFogAuth";

export function LiquidityFog() {
  const router = useRouter();
  const { poolData, isLoading, error, isAuthenticated, deposit, withdraw } =
    useLiquidityFogAuth();

  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);
      // In real implementation, this would open a modal for amount input
      await deposit(100);
      alert("Deposit successful!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      // In real implementation, this would open a modal for amount input
      await withdraw(50);
      alert("Withdrawal successful!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
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
            Please login to access Liquidity Fog.
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
            Liquidity Fog
          </h1>
          <p className="text-zinc-500">
            Anonymity pool for private, non-attributable transactions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeposit}
            disabled={isDepositing || isLoading}
          >
            {isDepositing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Droplets className="mr-2 h-4 w-4" />
            )}
            Deposit
          </Button>
          <Button
            size="sm"
            onClick={handleWithdraw}
            disabled={isWithdrawing || isLoading}
          >
            {isWithdrawing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Droplets className="mr-2 h-4 w-4" />
            )}
            Withdraw
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Pool Status Card */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-8 text-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700 backdrop-blur-md">
            <Ghost className="h-10 w-10 text-zinc-400" />
          </div>

          {isLoading ? (
            <div className="space-y-4 w-full max-w-xs">
              <div className="h-8 w-48 bg-zinc-800/50 rounded animate-pulse mx-auto"></div>
              <div className="h-4 w-32 bg-zinc-800/50 rounded animate-pulse mx-auto"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">
                $ {poolData?.totalCapacity.toLocaleString()}.00
              </h2>
              <p className="text-zinc-500 text-sm mb-8">
                Testnet Pool Capacity ({poolData?.currency})
              </p>
            </>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase">Utilization</p>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-zinc-800/50 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-semibold text-white">
                  {poolData?.utilizationRate}%
                </p>
              )}
            </div>

            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-400" />
                <p className="text-xs text-zinc-500 uppercase">Anonymity Set</p>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-zinc-800/50 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-semibold text-white">
                  {poolData?.anonymitySetSize}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <p className="text-xs text-zinc-500 uppercase">ZK Throughput</p>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-zinc-800/50 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-semibold text-white">
                  {poolData?.zkProofThroughput} TPS
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          How Liquidity Fog Works
        </h3>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            <strong className="text-zinc-300">Privacy by Design:</strong> When
            you deposit funds into the Liquidity Fog, they become part of a
            shared pool with no individual attribution.
          </p>
          <p>
            <strong className="text-zinc-300">Zero-Knowledge Proofs:</strong>{" "}
            Withdrawals require generating a ZK proof that you previously
            deposited, without revealing which deposit was yours.
          </p>
          <p>
            <strong className="text-zinc-300">Anonymity Set:</strong> The larger
            the anonymity set (number of participants), the stronger your
            privacy guarantees.
          </p>
          <p>
            <strong className="text-zinc-300">No Accounts:</strong> There are no
            user accounts or balances stored on-chain. Only cryptographic proofs
            of authorization.
          </p>
        </div>
      </div>
    </div>
  );
}
