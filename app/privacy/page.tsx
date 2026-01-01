"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-lg">
            Kredo is built on a simple premise: we cannot lose what we do not
            have.
          </p>
        </div>

        <div className="space-y-12 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Data Minimization
            </h2>
            <p className="mb-4">
              Our architecture is designed to know as little about you as
              possible. We do not maintain user accounts, databases of personal
              information, or transaction history logs linked to your identity.
            </p>
            <p>
              When you interact with Kredo, you prove{" "}
              <span className="text-white font-medium">authorization</span>, not
              identity. Our servers verify Zero-Knowledge Proofs (ZK-SNARKs)
              that confirm you adhere to a policy, without revealing who you
              dependably are.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. On-Chain Footprint
            </h2>
            <p>
              Traditional blockchains record every transaction publicly. Kredo
              uses{" "}
              <span className="text-white font-medium">
                Liquidity Fog Pools
              </span>{" "}
              to decouple funding sources from spending destinations.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
              <li>
                Your wallet address is used only to generate proofs client-side.
              </li>
              <li>
                Your wallet address is never stored in our permanent protocol
                state.
              </li>
              <li>
                Your transaction history is not reconstructible from public
                data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. Local Storage
            </h2>
            <p>
              We may store encrypted session keys or preferences locally on your
              device to improve your experience. This data never leaves your
              device and can be cleared at any time by clearing your browser
              cache.
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
