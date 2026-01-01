"use client";

import React, { useState } from "react";
import { Sidebar, TabName } from "./layout/Sidebar";
import { Header } from "./layout/Header";

// Import Page Components
import { Overview } from "./pages/Overview";
import { SpendingIntents } from "./pages/SpendingIntents";
import { Permissions } from "./pages/Permissions";
import { LiquidityFog } from "./pages/LiquidityFog";
import { ProofHistory } from "./pages/ProofHistory";
import { ProtocolSettings } from "./pages/ProtocolSettings";
import { Identity } from "./pages/Identity";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabName>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "identity":
        return <Identity />;
      case "intents":
        return <SpendingIntents />;
      case "permissions":
        return <Permissions />;
      case "fog":
        return <LiquidityFog />;
      case "history":
        return <ProofHistory />;
      case "settings":
        return <ProtocolSettings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black font-sans text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
