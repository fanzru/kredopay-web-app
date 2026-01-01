"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoginPage as LoginComponent } from "@/components/auth/LoginPage";

export default function LoginPage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHOW_DAPP !== "true") {
      router.push("/");
      return;
    }

    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  return <LoginComponent />;
}
