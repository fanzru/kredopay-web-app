"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Plus, Lock, Users } from "lucide-react";

export function Permissions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Access Permissions
          </h1>
          <p className="text-zinc-500">
            Define who can spend what, when, and where.
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Policy
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Role Based Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-900/20 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Role-Based Policies
            </h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Manage permissions for teams and groups (e.g., "Engineering Team",
            "Marketing Budget").
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-medium text-zinc-300">
                Admin Role
              </span>
              <span className="text-xs text-emerald-500">Full Access</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-medium text-zinc-300">
                AI Agents
              </span>
              <span className="text-xs text-yellow-500">$50/day Limit</span>
            </div>
          </div>
        </div>

        {/* Global Constraints Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-900/20 text-rose-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Global Constraints
            </h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Safety rules that apply to all spending intents under this account.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-medium text-zinc-300">
                Max Transaction Size
              </span>
              <span className="text-xs text-zinc-400">$10,000.00</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-sm font-medium text-zinc-300">
                Approved Merchants Only
              </span>
              <span className="text-xs text-emerald-500">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
