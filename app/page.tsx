"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHOW_DAPP === "true") {
      router.push("/login");
    }
  }, [router]);

  // Optionally return null or a loader while redirecting if you want to avoid flash,
  // but rendering HeroSection briefly is fine or even desired if JS is slow.
  // Given the request "accessing this page will go to login", we can render HeroSection just in case or null.
  // I'll stick to rendering HeroSection as fallback content.

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
    </main>
  );
}
