"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
            <FileText className="h-6 w-6 text-purple-400" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-zinc-400 text-lg">
            By accessing Kredo, you agree to interact with a protocol, not a
            bank.
          </p>
        </div>

        <div className="space-y-12 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Protocol Interaction
            </h2>
            <p className="mb-4">
              Kredo is a non-custodial software protocol. We do not hold your
              funds, we do not manage your accounts, and we cannot undo
              transactions.
            </p>
            <p>
              When you use Kredo, you are directly interacting with smart
              contracts on the Solana blockchain. You retain full responsibility
              for your cryptographic keys and the authorization proofs you
              generate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. No Financial Advice
            </h2>
            <p>
              The Kredo interface provides visualization of blockchain state and
              proof generation tools. Nothing in this application constitutes
              financial advice, investment advice, or a recommendation to
              transact.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. Testnet Disclaimer
            </h2>
            <p>
              Kredo is currently in{" "}
              <span className="text-white font-medium">Testnet Mode</span>. The
              system is experimental. Assets used within the testnet environment
              have no real-world value. We are not liable for any errors, bugs,
              or system failures during this phase.
            </p>
          </section>

          <section className="pt-8 border-t border-zinc-900">
            <p className="text-xs text-zinc-500">
              Last Updated: January 1, 2026
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
