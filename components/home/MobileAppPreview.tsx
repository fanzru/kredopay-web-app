"use client";

import React from "react";
import {
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Scan,
  ShieldCheck,
  History,
  LayoutDashboard,
  Settings,
  Plus,
  Wifi,
  BatteryMedium,
} from "lucide-react";

// Custom Signal Icon for accurate iOS look
const IOSSignal = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 5.5C17 4.67157 17.6716 4 18.5 4C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20C17.6716 20 17 19.3284 17 18.5V5.5Z"
      opacity="1"
    />
    <path
      d="M11 9.5C11 8.67157 11.6716 8 12.5 8C13.3284 8 14 8.67157 14 9.5V18.5C14 19.3284 13.3284 20 12.5 20C11.6716 20 11 19.3284 11 18.5V9.5Z"
      opacity="1"
    />
    <path
      d="M5 14.5C5 13.6716 5.67157 13 6.5 13C7.32843 13 8 13.6716 8 14.5V18.5C8 19.3284 7.32843 20 6.5 20C5.67157 20 5 19.3284 5 18.5V14.5Z"
      opacity="1"
    />
  </svg>
);

export function MobileAppPreview() {
  return (
    <div className="relative mx-auto">
      {/* Outer Glow for presentation depth */}
      <div className="absolute inset-4 bg-purple-500/10 blur-3xl rounded-[3rem] -z-10" />

      {/* Device Frame - Matte Titanium Finish */}
      <div className="relative h-[720px] w-[360px] bg-[#1a1a1a] rounded-[55px] shadow-[0_0_4px_2px_#27272a_inset,0_0_0_1px_#000,0_30px_70px_-20px_rgba(0,0,0,0.6)] p-[7px] ring-1 ring-white/10">
        {/* Physical Buttons */}
        <div className="absolute top-28 -left-[2px] h-7 w-[3px] bg-zinc-700 rounded-l-[1px] shadow-sm opacity-80" />{" "}
        {/* Action */}
        <div className="absolute top-44 -left-[2px] h-12 w-[3px] bg-zinc-700 rounded-l-[1px] shadow-sm opacity-80" />{" "}
        {/* Vol + */}
        <div className="absolute top-60 -left-[2px] h-12 w-[3px] bg-zinc-700 rounded-l-[1px] shadow-sm opacity-80" />{" "}
        {/* Vol - */}
        <div className="absolute top-40 -right-[2px] h-20 w-[3px] bg-zinc-700 rounded-r-[1px] shadow-sm opacity-80" />{" "}
        {/* Power */}
        {/* Screen Outline */}
        <div className="h-full w-full bg-black rounded-[48px] overflow-hidden relative border-[6px] border-black ring-1 ring-zinc-800">
          {/* Dynamic Island */}
          <div className="absolute top-[11px] left-1/2 transform -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-[20px] z-50 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full flex items-center justify-end pr-2.5">
              {/* Camera Lens */}
              <div className="w-[10px] h-[10px] rounded-full bg-[#121212] flex items-center justify-center ring-1 ring-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#050505] opacity-50 blur-[0.5px]" />
              </div>
            </div>
          </div>

          {/* Screen Content - No Scroll */}
          <div className="h-full w-full bg-black text-white flex flex-col relative overflow-hidden font-sans">
            {/* iOS Status Bar */}
            <div className="px-8 pt-4 pb-2 flex items-center justify-between z-20 select-none">
              <span className="text-[16px] font-semibold text-white tracking-normal pl-2 font-sans">
                9:41
              </span>
              <div className="flex items-center gap-1.5 pr-2">
                <IOSSignal className="w-[18px] h-[18px] text-white" />
                <Wifi
                  className="w-[18px] h-[18px] text-white"
                  strokeWidth={2.5}
                />
                <div className="relative">
                  <BatteryMedium
                    className="w-[22px] h-[22px] text-white rotate-0"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            {/* App Header */}
            <div className="px-6 pt-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#9D4EDD] to-[#FF007F] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                  K
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[13px] text-zinc-400 font-medium leading-tight">
                    Welcome back
                  </span>
                  <span className="text-[15px] font-bold text-white leading-tight">
                    Accountless User
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                <Bell className="w-5 h-5 text-zinc-400" />
              </div>
            </div>

            {/* Main Balance Card */}
            <div className="px-6 pt-10 pb-8 relative z-10">
              <div className="text-center space-y-1 mb-8">
                <p className="text-[11px] text-zinc-500 font-bold tracking-[0.1em] uppercase">
                  Global Spending Limit
                </p>
                <div className="flex items-baseline justify-center gap-0.5 relative inline-flex">
                  <span className="text-sm font-medium text-zinc-500 self-start mt-2 mr-1">
                    $
                  </span>
                  <span className="text-[3.5rem] font-bold tracking-tighter text-white leading-none">
                    2,500
                  </span>
                  <span className="text-xl font-medium text-zinc-600 self-baseline">
                    .00
                  </span>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-4 gap-4 px-1">
                <ActionButton icon={ArrowUpRight} label="Send" />
                <ActionButton icon={ArrowDownLeft} label="Request" />
                <ActionButton icon={RefreshCw} label="Swap" />
                <ActionButton icon={Scan} label="Scan" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 rounded-2xl -z-10" />
                <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  readOnly
                  placeholder="Search intents, people..."
                  className="w-full bg-transparent border border-zinc-800/50 rounded-2xl py-3 pl-11 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none cursor-default font-medium"
                />
              </div>
            </div>

            {/* List Section */}
            <div className="flex-1 bg-zinc-900/40 rounded-t-[2.5rem] border-t border-white/5 backdrop-blur-2xl relative overflow-hidden">
              {/* List Header */}
              <div className="px-8 pt-6 pb-2 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-zinc-200">
                  Active Intents
                </h3>
                <button className="text-[13px] font-medium text-zinc-500">
                  See All
                </button>
              </div>

              {/* Items */}
              <div className="px-5 space-y-1.5 pt-2">
                <AssetRow
                  name="AWS Services"
                  desc="Infra Allowance"
                  amount="$540.20"
                  icon="☁️"
                  change="+2.4%"
                  isPositive={true}
                />
                <AssetRow
                  name="Flight Booking"
                  desc="Travel Agent"
                  amount="$850.00"
                  icon="✈️"
                  change="Maxed"
                  isPositive={false}
                />
              </div>

              {/* Gradient Fade at bottom of list */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
            </div>

            {/* Bottom Navigation - Authentic iOS Style */}
            <div className="absolute bottom-0 w-full h-[84px] bg-black/90 backdrop-blur-xl border-t border-white/5 flex items-start justify-between px-6 pt-3 z-30">
              <NavTab icon={LayoutDashboard} label="Home" active />
              <NavTab icon={History} label="History" />
              <div className="relative -top-6">
                <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform cursor-pointer">
                  <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
              </div>
              <NavTab icon={ShieldCheck} label="Perms" />
              <NavTab icon={Settings} label="Settings" />
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[135px] h-[5px] bg-white rounded-full z-40 pointer-events-none mix-blend-difference" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className="h-[62px] w-[62px] rounded-[22px] bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center transition-all duration-300 border border-zinc-800 group-hover:border-zinc-700 shadow-md">
        <Icon
          className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300"
          strokeWidth={1.5}
        />
      </div>
      <span className="text-[12px] font-medium text-zinc-500 group-hover:text-zinc-400 tracking-tight">
        {label}
      </span>
    </div>
  );
}

function AssetRow({
  name,
  desc,
  amount,
  icon,
  change,
  isPositive,
}: {
  name: string;
  desc: string;
  amount: string;
  icon: string;
  change: string;
  isPositive: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-colors cursor-default group">
      <div className="flex items-center gap-4">
        <div className="h-[46px] w-[46px] rounded-2xl bg-zinc-800/80 flex items-center justify-center text-xl shadow-sm border border-white/5 group-hover:border-white/10 group-hover:bg-zinc-800 transition-all">
          {icon}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-zinc-100 group-hover:text-white transition-colors tracking-tight">
            {name}
          </p>
          <p className="text-[13px] font-medium text-zinc-500">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[16px] font-bold text-white tracking-tight">
          {amount}
        </p>
        <p
          className={`text-[12px] font-semibold ${
            isPositive ? "text-emerald-500" : "text-zinc-500"
          }`}
        >
          {change}
        </p>
      </div>
    </div>
  );
}

function NavTab({
  icon: Icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-14 gap-1 cursor-default group">
      <Icon
        className={`w-[26px] h-[26px] ${
          active ? "text-white" : "text-zinc-600 group-hover:text-zinc-500"
        } transition-colors`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`text-[10px] font-medium ${
          active ? "text-white" : "text-zinc-600 group-hover:text-zinc-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
