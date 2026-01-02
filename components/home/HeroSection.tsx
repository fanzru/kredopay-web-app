import React, { Suspense } from "react";
import Link from "next/link";
import Hero3D from "./Hero3D";
import { Button } from "@/components/ui/Button";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { MobileAppPreview } from "./MobileAppPreview";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col justify-center overflow-hidden font-sans">
      {/* 3D Background - Loaded dynamically */}
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        }
      >
        <Hero3D />
      </Suspense>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full grid lg:grid-cols-2 gap-12 items-center flex-grow px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-2xl">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-8 font-sans">
            THE ALL-IN-ONE
            <br />
            APP IS
            <br />
            <ScrambleText
              words={[
                "COMING SOON",
                "IN PROGRESS",
                "UNDER CONSTRUCTION",
                "BEING BUILT",
              ]}
              delay={500}
              pauseDuration={3000}
              className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 pb-1"
            />
          </h1>

          {/* Subheadline descriptions */}
          <div className="max-w-xl space-y-6 mb-12">
            <p className="text-2xl md:text-3xl font-normal text-gray-200 leading-tight">
              Our team is working hard to bring you the first
              Authorization-based Financial Operating System.
            </p>
            <p className="text-lg text-gray-400 font-light leading-relaxed">
              Kredo App will eliminate accounts entirely. No wallets to secure,
              no balances to expose. Just pure cryptographic permission.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Button
              href="https://pump.fun/coin/F2hgieC18MeUWaWMoyaxLSQCzS7yAjRz1HgmbGAEpump"
              size="sm"
              variant="primary"
              target="_blank"
            >
              BUY $KREDO
            </Button>
            <Button
              href="https://github.com/kredopay"
              size="sm"
              variant="outline"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Mobile App Preview - Visible on all devices */}
        <div className="flex justify-center perspective-1000 mt-16 lg:mt-0">
          <motion.div
            initial={{ rotateY: 15, rotateX: 5, opacity: 0, y: 50 }}
            animate={{ rotateY: -5, rotateX: 0, opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <MobileAppPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
