"use client";

import React from "react";
import {
  LayoutDashboard,
  WalletCards,
  ShieldCheck,
  History,
  Settings,
  Zap,
  LogOut,
  Ghost,
} from "lucide-react";
import { motion } from "framer-motion";

export type TabName =
  | "overview"
  | "intents"
  | "permissions"
  | "fog"
  | "history"
  | "settings";

interface SidebarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" as TabName },
  { icon: Zap, label: "Spending Intents", id: "intents" as TabName },
  { icon: ShieldCheck, label: "Permissions", id: "permissions" as TabName },
  { icon: Ghost, label: "Liquidity Fog", id: "fog" as TabName },
  { icon: History, label: "Proof History", id: "history" as TabName },
  { icon: Settings, label: "Protocol Settings", id: "settings" as TabName },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-black h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Kredo<span className="text-zinc-500">App</span>
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-sm font-medium w-full text-left ${
                activeTab === item.id
                  ? "text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="sidebar-active-tab"
                  className="absolute inset-0 rounded-xl bg-zinc-900 border border-zinc-800"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-900">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-4 rounded-xl mb-4">
          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase">Audit Status</span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            ZK Circuits are currently running in{" "}
            <span className="text-white font-semibold">Testnet Mode</span>.
          </p>
        </div>

        <button className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 text-sm font-medium transition-colors w-full">
          <LogOut size={18} />
          Disconnect Session
        </button>
      </div>
    </aside>
  );
}
