"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Shield,
  RefreshCw,
  Cpu,
  Network,
  Lock,
  Globe,
  Terminal,
  Twitter,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { ScrambleText } from "@/components/ui/ScrambleText";

interface GuardianNode {
  id: string;
  name: string;
  region: string;
  uptime: string;
  latency: number;
  status: "online" | "syncing" | "offline";
  throughput: number;
  version: string;
  load: number;
}

const MOCK_NODES: GuardianNode[] = [
  {
    id: "node_01",
    name: "GUARDIAN-NEXUS-ALPHA",
    region: "US-EAST (VIRGINIA)",
    uptime: "99.99%",
    latency: 12,
    status: "online",
    throughput: 1250,
    version: "v0.8.4-PROD",
    load: 42,
  },
  {
    id: "node_02",
    name: "GUARDIAN-NEXUS-BRAVO",
    region: "EU-WEST (IRELAND)",
    uptime: "99.95%",
    latency: 45,
    status: "online",
    throughput: 980,
    version: "v0.8.4-PROD",
    load: 68,
  },
  {
    id: "node_03",
    name: "GUARDIAN-NEXUS-CHARLIE",
    region: "AP-SOUTHEAST (SINGAPORE)",
    uptime: "99.98%",
    latency: 120,
    status: "online",
    throughput: 1120,
    version: "v0.8.4-PROD",
    load: 15,
  },
];

export function Community() {
  const { showToast } = useToast();
  const [nodes, setNodes] = useState<GuardianNode[]>(MOCK_NODES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          latency: Math.max(8, node.latency + (Math.random() * 4 - 2)),
          throughput: Math.max(800, node.throughput + (Math.random() * 20 - 10)),
          load: Math.min(100, Math.max(5, node.load + (Math.random() * 6 - 3)))
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("success", "Guardian Network Synchronized");
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-32">
      {/* Hero Section - Aligned with Kredo Blue theme */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
          <div className="absolute top-0 right-0 h-full w-1/3 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/20 blur-xl" />
            <div className="absolute top-0 right-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-lg" />
            <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border-[20px] border-white/5 opacity-50" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Consensus Active
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white">
                COMMUNITY <br />
                <span className="text-blue-500">
                  & GUARDIANS
                </span>
              </h1>
              <p className="text-zinc-400 max-w-xl text-lg leading-relaxed">
                The Kredo Guardian Network ensures zero-knowledge verification across global liquidity fog pools. 
                Securing <ScrambleText text="$842K" className="text-blue-400 font-mono" /> in spendable authorization.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.open('https://twitter.com/kredopay', '_blank')}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                <Twitter className="h-4 w-4" />
                Follow Update
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Resync Nodes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - Aligned with Dashboard stats style */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Fog Pool Density", value: "DECENT", sub: "1.2k Anonymity Set", color: "text-blue-400", icon: Globe },
          { label: "Total Fog Liquidity", value: "$420K", sub: "Non-attributable Capital", color: "text-white", icon: Network },
          { label: "Intent Throughput", value: "128", sub: "Authorizations/sec", color: "text-blue-400", icon: Zap },
          { label: "ZK-Proof Batch", value: "#42", sub: "Recursive Proving...", color: "text-indigo-400", icon: Shield },
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 hover:bg-zinc-900/50 transition-all shadow-xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1 font-medium">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Intent Execution Pipeline - Aligned with Activity/Transaction items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Intent Execution Pipeline
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Stateless Engine Live
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "INTENT-0x882...", type: "VIRTUAL_CARD_SPEND", status: "VERIFYING_ZK", amount: "$120.00", merchant: "Amazon" },
                { id: "INTENT-0x129...", type: "RECURRING_AUTH", status: "POLICY_CHECK", amount: "$15.00", merchant: "Netflix" },
                { id: "INTENT-0x441...", type: "CROSS_BORDER", status: "SETTLING", amount: "$2,400.00", merchant: "Airbnb" },
              ].map((intent, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-blue-400">{intent.id}</div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">{intent.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{intent.amount}</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{intent.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Nodes - Aligned with Card/Item list style */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              Active Guardian Nodes
            </h2>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {nodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900/50 to-transparent p-6 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Cpu size={24} />
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#050505] border border-zinc-800 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                            {node.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Globe size={12} /> {node.region}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Activity size={12} /> {node.version}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
                        <div className="space-y-1">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Latency</p>
                          <p className="text-sm font-mono text-white">{node.latency.toFixed(1)}ms</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Load</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${node.load > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                                animate={{ width: `${node.load}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{Math.round(node.load)}%</span>
                          </div>
                        </div>
                        <div className="hidden md:block space-y-1">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Throughput</p>
                          <p className="text-sm font-mono text-white">{Math.round(node.throughput)} TPS</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="h-9 w-9 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center justify-center">
                          <Terminal size={16} />
                        </button>
                        <button className="h-9 w-9 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center justify-center">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar - Aligned with Overview Sidebar */}
        <div className="space-y-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-400" />
            Consensus Logs
          </h3>
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 divide-y divide-zinc-800">
            {[
              { type: 'SUCCESS', msg: 'ZK-Proof verified for INTENT_4821', time: '2s ago' },
              { type: 'SUCCESS', msg: 'Nexus-Alpha synchronized with FogPool', time: '5s ago' },
              { type: 'WARNING', msg: 'High latency detected in AP-Southeast', time: '12s ago' },
              { type: 'SUCCESS', msg: 'Epoch 14,291 successfully finalized', time: '1m ago' },
            ].map((log, i) => (
              <div key={i} className="p-4 flex gap-3 group hover:bg-white/5 transition-all">
                <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${log.type === 'SUCCESS' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <div className="space-y-1">
                  <p className="text-[11px] text-zinc-300 font-medium leading-tight">
                    {log.msg}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{log.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 hover:bg-zinc-900/50 transition-all">
            <div className="relative z-10 space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Network Blueprint</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The Kredo network uses a distributed consensus model to verify 
                spending intents with zero-knowledge proofs.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                Read Whitepaper <ExternalLink size={14} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Network size={120} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}