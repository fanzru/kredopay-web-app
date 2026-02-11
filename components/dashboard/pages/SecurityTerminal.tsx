"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Activity,
  Plus,
  Loader2,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useSecurityTerminalAuth } from "../hooks/useSecurityTerminalAuth";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        className: "bg-emerald-900/30 text-emerald-400",
        icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
      };
    case "processing":
      return {
        label: "Processing",
        className: "bg-yellow-900/30 text-yellow-400",
        icon: <Clock className="h-3.5 w-3.5 text-yellow-400" />,
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-red-900/30 text-red-400",
        icon: <XCircle className="h-3.5 w-3.5 text-red-400" />,
      };
    default:
      return {
        label: "Queued",
        className: "bg-zinc-900/30 text-zinc-400",
        icon: <Clock className="h-3.5 w-3.5 text-zinc-500" />,
      };
  }
};

export function SecurityTerminal() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    sessions,
    isLoading,
    error,
    isAuthenticated,
    createSession,
    refreshSessions,
  } = useSecurityTerminalAuth();

  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("Kredo Mixer Relay");
  const [intentId, setIntentId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const parsedAmount =
        amount.trim().length > 0 ? Number(amount) : undefined;

      if (parsedAmount !== undefined && Number.isNaN(parsedAmount)) {
        showToast("error", "Amount must be a valid number");
        return;
      }

      if (parsedAmount !== undefined && parsedAmount <= 0) {
        showToast("error", "Amount must be greater than zero");
        return;
      }

      await createSession({
        amount: parsedAmount,
        currency: "USDC",
        intentId: intentId.trim() || undefined,
        provider: provider.trim() || undefined,
      });

      setAmount("");
      setIntentId("");
      showToast("success", "Security trace initialized");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create trace"
      );
    } finally {
      setIsCreating(false);
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
            Please login to access the security terminal.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Security Terminal
          </h1>
          <p className="text-zinc-500">
            Trace how each intent routes through the privacy relay and mixer
            layer.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSessions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Activity className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Mixer Trace Builder
                </p>
                <p className="text-xs text-zinc-500">
                  Generate a security route snapshot
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500">Amount (optional)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Intent ID</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="intent-..."
                  value={intentId}
                  onChange={(e) => setIntentId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Security Provider</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                />
              </div>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Generate Trace
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-900/30 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Live Privacy Shield
                </p>
                <p className="text-xs text-zinc-500">
                  Mixer relays mask every funding path
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Each trace verifies authorization, shuffles liquidity fragments,
              and seals settlement metadata before release.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                <p className="text-sm text-zinc-400">Loading traces...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
              <Shield className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No security traces yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Generate a trace to view mixer routing details
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Trace ID</p>
                    <p className="text-sm font-semibold text-white">
                      {session.id}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Provider: {session.provider}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Trace Hash</p>
                      <p className="text-xs font-mono text-zinc-300">
                        {session.traceHash}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">ETA</p>
                      <p className="text-sm text-zinc-200">
                        {session.etaSeconds}s
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {session.steps.map((step) => {
                    const badge = getStatusBadge(step.status);
                    return (
                      <div
                        key={step.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            {step.label}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{step.detail}</p>
                      </div>
                    );
                  })}
                </div>

                {(session.amount || session.intentId) && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-500 flex flex-wrap gap-4">
                    {session.amount && (
                      <span>
                        Amount: {session.amount.toLocaleString()}{" "}
                        {session.currency}
                      </span>
                    )}
                    {session.intentId && (
                      <span>Intent: {session.intentId}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
