"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Hardcoded to false by default - only redirect if explicitly set to "true"
    const showDapp =
      process.env.NEXT_PUBLIC_SHOW_DAPP === "true" ? true : false;
    if (showDapp) {
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [router]);

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
    </main>
  );
}
