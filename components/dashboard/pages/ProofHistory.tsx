"use client";

import React from "react";
import { History, ExternalLink, CheckCircle } from "lucide-react";

export function ProofHistory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Proof History
          </h1>
          <p className="text-zinc-500">
            Ledger of cryptographic proofs generated and verified.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">Proof ID</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-zinc-300">
                  0x{Math.random().toString(16).slice(2, 10)}...
                </td>
                <td className="px-6 py-4">
                  {i % 2 === 0 ? "Spending Authorization" : "Identity In-Group"}
                </td>
                <td className="px-6 py-4">2 mins ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Etherscan <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
