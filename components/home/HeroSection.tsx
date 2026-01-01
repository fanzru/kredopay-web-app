import React, { Suspense } from "react";
import Link from "next/link";
import Hero3D from "./Hero3D";
import { Button } from "@/components/ui/Button";
import { ScrambleText } from "@/components/ui/ScrambleText";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-black text-white flex flex-col justify-center overflow-hidden font-sans">
      {/* 3D Background - Loaded dynamically */}
      <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
        <Hero3D />
      </Suspense>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full flex flex-col justify-center flex-grow px-6 md:px-12 pt-0 pb-0">
        <div className="max-w-2xl transform translate-y-[-5%]">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 font-sans">
            THE ALL-IN-ONE
            <br />
            APP IS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              <ScrambleText
                words={[
                  "COMING SOON",
                  "IN PROGRESS",
                  "UNDER CONSTRUCTION",
                  "BEING BUILT",
                ]}
                delay={500}
                pauseDuration={3000}
              />
            </span>
          </h1>

          {/* Subheadline descriptions */}
          <div className="max-w-xl space-y-6 mb-12">
            <p className="text-2xl md:text-3xl font-normal text-gray-200 leading-tight">
              Our team is working hard to bring you the first
              Authorization-based Financial Operating System.
            </p>
            <p className="text-lg text-gray-400 font-light leading-relaxed">
              Kredo App will eliminate accounts entirely. No wallets to secure,
              no balances to expose. Just pure cryptographic permission for
              Teams, AI Agents, and You.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Button href="https://pump.fun" size="lg" variant="primary">
              $KREDO
            </Button>
            <Button href="/dashboard" size="lg" variant="outline">
              Launch App
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
