"use client";

import React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Ghost,
  Send,
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
  {
    icon: LayoutDashboard,
    label: "Overview",
    id: "overview" as TabName,
    description: "Permission overview & stats",
  },
  {
    icon: Send,
    label: "Spending Intents",
    id: "intents" as TabName,
    description: "Create & manage intents",
  },
  {
    icon: ShieldCheck,
    label: "Permissions",
    id: "permissions" as TabName,
    description: "Access policies & rules",
  },
  {
    icon: Ghost,
    label: "Liquidity Fog",
    id: "fog" as TabName,
    description: "Pooled liquidity pools",
  },
  {
    icon: History,
    label: "Proof History",
    id: "history" as TabName,
    description: "ZK proof audit trail",
  },
  {
    icon: Settings,
    label: "Settings",
    id: "settings" as TabName,
    description: "Protocol configuration",
  },
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

        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full text-left group ${
                  isActive
                    ? "text-white"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute inset-0 rounded-xl bg-zinc-900 border border-zinc-800"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                  <item.icon
                    size={18}
                    className={`shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-white"
                    }`}
                  />
                  <span className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {isActive && (
                      <div className="text-xs text-zinc-500 mt-0.5 truncate">
                        {item.description}
                      </div>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
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

        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/10 text-sm font-medium transition-colors w-full">
          <LogOut size={18} />
          Disconnect Session
        </button>
      </div>
    </aside>
  );
}
