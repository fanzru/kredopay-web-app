"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Check feature flag
    if (process.env.NEXT_PUBLIC_SHOW_DAPP !== "true") {
      router.push("/");
      return;
    }

    // 2. Check for auth token in localStorage
    const token = localStorage.getItem("kredo_auth_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Don't render layout until authenticated
  }

  return (
    <ToastProvider>
      <div className="relative min-h-screen w-full bg-black/95 font-sans text-zinc-100 flex flex-col overflow-hidden selection:bg-indigo-500/30">
        {/* Background Ambience */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col flex-1 w-full h-full">
          <Header />
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 pb-32">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
