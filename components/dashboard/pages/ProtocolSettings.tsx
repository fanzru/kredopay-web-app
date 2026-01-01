"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Settings, Save } from "lucide-react";

export function ProtocolSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Protocol Settings
          </h1>
          <p className="text-zinc-500">
            Configure your client-side ZK-Prover and network preferences.
          </p>
        </div>
        <Button size="sm">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-8">
        {/* Network Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Network Connection
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                RPC Endpoint
              </label>
              <input
                type="text"
                defaultValue="https://rpc.kredo-testnet.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Prover Node
              </label>
              <input
                type="text"
                defaultValue="wss://prover-01.kredo.org"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Client Privacy Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Privacy & Proofs
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Local Proof Generation
                </p>
                <p className="text-xs text-zinc-500">
                  Generate ZK proofs in-browser (slower but max privacy).
                </p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Auto-Obfuscate IP
                </p>
                <p className="text-xs text-zinc-500">
                  Route connection through Kredo Relay.
                </p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-700">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
