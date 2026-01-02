"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TabName } from "../types";
import { MENU_ITEMS } from "../constants/menuItems";
import { StorageService } from "../services/storage";

export type { TabName };

interface SidebarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleDisconnect = () => {
    StorageService.removeAuthToken();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col border-r border-zinc-800 bg-black h-screen sticky top-0"
    >
      <div className="p-4 flex flex-col h-full">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3 px-2"
          } mb-8 h-10`}
        >
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/logo.png"
              alt="Kredo Logo"
              fill
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap"
            >
              Kredo<span className="text-zinc-600">App</span>
            </motion.span>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id!)}
                className={`relative flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3 px-3"
                } py-2.5 rounded-lg transition-all duration-200 text-sm font-medium w-full group ${
                  isActive
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute inset-0 rounded-lg bg-zinc-900 border border-zinc-800"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-zinc-900 flex flex-col gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/40 transition-colors w-full"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>

          <button
            onClick={handleDisconnect}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/10 text-sm font-medium transition-colors w-full group`}
            title="Disconnect"
          >
            <LogOut size={18} className="group-hover:text-red-400" />
            {!isCollapsed && <span>Disconnect</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
