"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export interface Proof {
  id: string;
  type:
    | "spending_authorization"
    | "identity_in_group"
    | "solvency"
    | "compliance";
  timestamp: Date;
  status: "verified" | "pending" | "failed";
  txHash?: string;
  blockExplorer?: string;
}

export function useProofHistory() {
  const { publicKey, connected } = useWallet();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setProofs([]);
      setIsLoading(false);
      return;
    }

    const fetchProofHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to Kredo backend
        // This should fetch proof history associated with the user's session
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Simulated proof data - replace with actual API response
        const mockProofs: Proof[] = [
          {
            id: `0x${Math.random().toString(16).slice(2, 10)}`,
            type: "spending_authorization",
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            status: "verified",
            txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            blockExplorer: "https://solscan.io/tx/",
          },
          {
            id: `0x${Math.random().toString(16).slice(2, 10)}`,
            type: "identity_in_group",
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            status: "verified",
            txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            blockExplorer: "https://solscan.io/tx/",
          },
          {
            id: `0x${Math.random().toString(16).slice(2, 10)}`,
            type: "solvency",
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            status: "verified",
            txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            blockExplorer: "https://solscan.io/tx/",
          },
          {
            id: `0x${Math.random().toString(16).slice(2, 10)}`,
            type: "compliance",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: "pending",
          },
        ];

        setProofs(mockProofs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch proof history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProofHistory();
  }, [connected, publicKey]);

  const refreshProofs = async () => {
    // Trigger a refresh of proof history
    if (!connected || !publicKey) return;

    setIsLoading(true);
    // Re-fetch logic here
    setIsLoading(false);
  };

  return {
    proofs,
    isLoading,
    error,
    refreshProofs,
  };
}
