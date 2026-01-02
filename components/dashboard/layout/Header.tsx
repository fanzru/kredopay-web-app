"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MENU_ITEMS } from "../constants/menuItems";
import { StorageService } from "../services/storage";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const handleDisconnect = () => {
    // Remove all auth-related data from localStorage
    StorageService.removeAuthToken();
    localStorage.removeItem("kredo_auth_token");
    localStorage.removeItem("kredo_user_email");
    // Redirect to login
    router.push("/login");
    // Force reload to clear any cached state
    window.location.href = "/login";
  };

  // Show only first 2 menu items in dock, rest in hamburger
  const visibleItems = MENU_ITEMS.slice(0, 2);
  const menuItems = MENU_ITEMS.slice(2).filter(
    (item: any) => item.id !== "settings"
  );

  return (
    <>
      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xs"
            >
              <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-2xl">
                <div className="space-y-2">
                  {menuItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        onClick={() => setShowMenu(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Simplified Floating Bottom Dock (Max 4 items) --- */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
        >
          {/* Logo */}
          <Link href="/dashboard" className="flex-shrink-0">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Kredo"
                width={20}
                height={20}
                className="object-contain drop-shadow-md"
              />
            </div>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Main Navigation Items (2 items) */}
          {visibleItems.map((item: any) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href!}
                className="relative group flex-shrink-0"
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-white text-black shadow-lg scale-110"
                      : "text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-105"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                  {/* Tooltip */}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                    {item.label}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              showMenu
                ? "bg-white text-black shadow-lg scale-110"
                : "text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-105"
            }`}
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Logout Button */}
          <button
            onClick={handleDisconnect}
            className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all flex items-center justify-center group"
          >
            <LogOut size={18} />
          </button>
        </motion.nav>
      </div>
    </>
  );
}
