"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dashboard as DashboardComponent } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHOW_DAPP !== "true") {
      router.push("/");
      return;
    }

    if (!connected) {
      router.push("/login");
    }
  }, [connected, router]);

  if (!connected) {
    return null;
  }

  return <DashboardComponent />;
}
