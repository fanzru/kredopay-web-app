"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { publicKey, disconnect } = useWallet();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDisconnect = async () => {
    await disconnect();
    router.push("/login"); // Optional since the protected route will handle it, but good for UX
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return "Connecting...";
    // Masking the address to align with "Accountless" vision
    // We treat the public key as a ZK-Session-ID visually
    return `ZK-ID: ${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-black/50 backdrop-blur-xl px-6">
      {/* Search Bar */}
      <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 transition-colors focus-within:border-zinc-700">
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search permissions, intents, or policies..."
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
        />
        <div className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Network Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-zinc-300">
            Kredo Testnet
          </span>
          <ChevronDown className="h-3 w-3 text-zinc-500" />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* User / Identity Status */}
        <div className="h-8 w-[1px] bg-zinc-800 mx-2" />

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 hover:border-zinc-500 bg-zinc-900 p-1 pr-3 transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {publicKey
                ? truncateAddress(publicKey.toBase58())
                : "Not Connected"}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-zinc-500 transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-xl">
              <button
                onClick={handleDisconnect}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
