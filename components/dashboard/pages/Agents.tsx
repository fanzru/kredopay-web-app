"use client";

import React, { useState } from "react";
import {
  Bot,
  Plus,
  Shield,
  CreditCard,
  Activity,
  Copy,
  CheckCircle,
  PauseCircle,
  Terminal,
  Code,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// Mock Data Type
interface Agent {
  id: string;
  name: string;
  role: string;
  dailyLimit: number;
  spentToday: number;
  constraints: string[];
  status: "active" | "paused";
  apiKey: string;
  lastActive: string;
}

// Mock Data
const MOCK_AGENTS: Agent[] = [
  {
    id: "agt_01",
    name: "Travel Assistant",
    role: "Booking & Reservations",
    dailyLimit: 2000,
    spentToday: 450.5,
    constraints: ["Category: Travel", "Merchant: Airlines, Hotels"],
    status: "active",
    apiKey: "kredo_sk_...8f92",
    lastActive: "2 mins ago",
  },
  {
    id: "agt_02",
    name: "Infrastructure Bot",
    role: "Server Payments",
    dailyLimit: 100,
    spentToday: 24.0,
    constraints: ["Merchant: AWS, Vercel, DigitalOcean"],
    status: "active",
    apiKey: "kredo_sk_...b2x1",
    lastActive: "1 hour ago",
  },
  {
    id: "agt_03",
    name: "Research Agent",
    role: "Data Access",
    dailyLimit: 50,
    spentToday: 0,
    constraints: ["Category: Subscriptions", "Max-Tx: $20"],
    status: "paused",
    apiKey: "kredo_sk_...992a",
    lastActive: "3 days ago",
  },
];

export function Agents() {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [isCreating, setIsCreating] = useState(false);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast("success", "API Key copied to clipboard");
  };

  const handleCreateAgent = () => {
    setIsCreating(true);
    // Simulate creation delay
    setTimeout(() => {
      const newAgent: Agent = {
        id: `agt_${Math.floor(Math.random() * 1000)}`,
        name: "New Trading Bot",
        role: "DeFi Operations",
        dailyLimit: 500,
        spentToday: 0,
        constraints: ["Protocol: Uniswap", "Chain: Solana"],
        status: "active",
        apiKey: `kredo_sk_...${Math.floor(Math.random() * 9999)}`,
        lastActive: "Just now",
      };
      setAgents([newAgent, ...agents]);
      setIsCreating(false);
      showToast("success", "New agent wallet initialized");
    }, 1500);
  };

  const toggleStatus = (id: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: agent.status === "active" ? "paused" : "active",
            }
          : agent
      )
    );
    showToast("success", "Agent status updated");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-8 w-8 text-indigo-400" />
            AI Agent Wallets
          </h1>
          <p className="text-zinc-500 mt-1">
            Delegate spending power to autonomous agents with strictly defined
            constraints.
          </p>
        </div>
        <Button onClick={handleCreateAgent} disabled={isCreating}>
          {isCreating ? (
            <Activity className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Create Agent Wallet
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-900/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Active Agents</p>
            <p className="text-2xl font-bold text-white">
              {agents.filter((a) => a.status === "active").length}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Daily Limit</p>
            <p className="text-2xl font-bold text-white">
              $
              {agents
                .filter((a) => a.status === "active")
                .reduce((acc, curr) => acc + curr.dailyLimit, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">24h Volume</p>
            <p className="text-2xl font-bold text-white">
              $
              {agents
                .reduce((acc, curr) => acc + curr.spentToday, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Agent Instances</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                agent.status === "active"
                  ? "border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/30 hover:bg-zinc-900/50"
                  : "border-zinc-800/50 bg-zinc-950/30 opacity-70"
              }`}
            >
              {/* Active Indicator Line */}
              {agent.status === "active" && (
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        agent.status === "active"
                          ? "bg-gradient-to-br from-zinc-800 to-zinc-900 text-white border border-zinc-700"
                          : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                      }`}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Code className="h-3 w-3" /> {agent.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStatus(agent.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      agent.status === "active"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30"
                        : "bg-yellow-950/30 text-yellow-400 border-yellow-900/50 hover:bg-yellow-900/30"
                    }`}
                  >
                    {agent.status === "active" ? "Active" : "Paused"}
                  </button>
                </div>

                {/* Limits & Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Daily Usage</span>
                    <span className="text-white">
                      ${agent.spentToday} / ${agent.dailyLimit}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        agent.status === "active"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                          : "bg-zinc-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          (agent.spentToday / agent.dailyLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Constraints & API Key */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Constraints
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agent.constraints.map((constraint, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300"
                        >
                          {constraint}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      API Key
                    </p>
                    <div
                      onClick={() => handleCopyKey(agent.apiKey)}
                      className="group/key cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <code className="text-xs text-zinc-400 font-mono truncate mr-2">
                        {agent.apiKey}
                      </code>
                      <Copy className="h-3 w-3 text-zinc-600 group-hover/key:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3 w-3" />
                    SDK Integration Ready
                  </div>
                  <span>Last active: {agent.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
          
           {/* Marketing/Upsell Card */}
           <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/20 transition-all p-6 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer" onClick={handleCreateAgent}>
            <div className="h-14 w-14 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-zinc-400 group-hover:text-white"/>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white">Add New Agent</h3>
                <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1">Create a dedicated wallet for your AI assistants with custom spending logic.</p>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
