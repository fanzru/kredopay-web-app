"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { MENU_ITEMS } from "../constants/menuItems";
import { StorageService } from "../services/storage";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleDisconnect = () => {
    StorageService.removeAuthToken();
    router.push("/login");
  };

  return (
    <>
      {/* --- Unified Floating Bottom Dock --- */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-2xl sm:rounded-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-x-auto no-scrollbar max-w-full"
        >
          {/* Logo (Icon Only) */}
          <Link href="/dashboard" className="flex-shrink-0">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Kredo"
                width={20}
                height={20}
                className="object-contain drop-shadow-md w-5 h-5"
              />
            </div>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          {/* Navigation Items */}
          {MENU_ITEMS.filter((item: any) => item.id !== "settings").map(
            (item: any) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="relative group flex-shrink-0"
                >
                  <div
                    className={`relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black shadow-lg scale-105 sm:scale-110"
                        : "text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-105"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="sm:w-[20px] sm:h-[20px]"
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* Tooltip (Desktop Only) */}
                    <span className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                      {item.label}
                    </span>
                  </div>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div
                      layoutId="dock-active"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white hidden sm:block"
                    />
                  )}
                </Link>
              );
            }
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          {/* Right Actions Group */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Profile Display */}
            <div className="h-9 sm:h-10 px-2 sm:px-3 rounded-full bg-zinc-900/50 border border-white/5 flex items-center gap-2 backdrop-blur-md">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
                ZK
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-200 hidden sm:block">
                Dev User
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleDisconnect}
              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all flex items-center justify-center sm:justify-start gap-2 backdrop-blur-md group"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">
                Logout
              </span>
            </button>
          </div>
        </motion.nav>
      </div>
    </>
  );
}
