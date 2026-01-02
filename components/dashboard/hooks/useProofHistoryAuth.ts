"use client";

import { useState, useEffect } from "react";

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

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

export function useProofHistoryAuth() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setProofs([]);
      setIsLoading(false);
      return;
    }

    const fetchProofHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to Kredo backend/database
        // This should fetch proof history associated with the user's session
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Start with empty history to prevent "larping" with fake data
        // Proofs will be added here as user interacts with the system
        const userProofs: Proof[] = [];

        setProofs(userProofs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch proof history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProofHistory();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const refreshProofs = async () => {
    // Trigger a refresh of proof history
    if (!isAuthenticated) return;

    setIsLoading(true);
    // Re-fetch logic here
    setIsLoading(false);
  };

  return {
    proofs,
    isLoading,
    error,
    isAuthenticated,
    refreshProofs,
  };
}
