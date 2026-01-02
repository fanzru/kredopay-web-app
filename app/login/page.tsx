"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoginPage as LoginComponent } from "@/components/auth/LoginPage";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check feature flag
    if (process.env.NEXT_PUBLIC_SHOW_DAPP !== "true") {
      router.push("/");
      return;
    }

    // Check if user is already authenticated (has token in localStorage)
    const token = localStorage.getItem("kredo_auth_token");
    if (token) {
      // User is already logged in, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    // Check wallet connection
    if (connected) {
      router.push("/dashboard");
      return;
    }

    setIsChecking(false);
  }, [connected, router]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <LoginComponent />;
}
