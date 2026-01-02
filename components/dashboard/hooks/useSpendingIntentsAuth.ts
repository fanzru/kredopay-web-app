"use client";

import { useState, useEffect } from "react";

export interface SpendingIntent {
  id: string;
  type:
    | "merchant_payment"
    | "saas_subscription"
    | "p2p_transfer"
    | "contract_interaction";
  description: string;
  amount: number;
  currency: string;
  status: "pending_proof" | "authorized" | "executed" | "rejected";
  createdAt: Date;
  merchant?: string;
  category?: string;
}

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

export function useSpendingIntentsAuth() {
  const [intents, setIntents] = useState<SpendingIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setIntents([]);
      setIsLoading(false);
      return;
    }

    const fetchIntents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to Kredo backend
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Simulated spending intents
        const mockIntents: SpendingIntent[] = [
          {
            id: `intent-${Date.now()}-1`,
            type: "merchant_payment",
            description: "Merchant Payment",
            amount: 150,
            currency: "USDC",
            status: "pending_proof",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            merchant: "Amazon",
            category: "Shopping",
          },
          {
            id: `intent-${Date.now()}-2`,
            type: "saas_subscription",
            description: "SaaS Subscription",
            amount: 300,
            currency: "USDC",
            status: "authorized",
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            merchant: "Netflix",
            category: "Entertainment",
          },
          {
            id: `intent-${Date.now()}-3`,
            type: "merchant_payment",
            description: "Merchant Payment",
            amount: 450,
            currency: "USDC",
            status: "authorized",
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
            merchant: "Shopify",
            category: "Shopping",
          },
          {
            id: `intent-${Date.now()}-4`,
            type: "saas_subscription",
            description: "SaaS Subscription",
            amount: 600,
            currency: "USDC",
            status: "executed",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            merchant: "GitHub",
            category: "Development",
          },
        ];

        setIntents(mockIntents);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch spending intents"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntents();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const createIntent = async (
    type: SpendingIntent["type"],
    amount: number,
    description: string,
    merchant?: string
  ) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual intent creation with ZK proof
      console.log("Creating spending intent:", {
        type,
        amount,
        description,
        merchant,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newIntent: SpendingIntent = {
        id: `intent-${Date.now()}`,
        type,
        description,
        amount,
        currency: "USDC",
        status: "pending_proof",
        createdAt: new Date(),
        merchant,
      };

      setIntents((prev) => [newIntent, ...prev]);
      return newIntent;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create intent"
      );
    }
  };

  const cancelIntent = async (intentId: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement intent cancellation
      console.log("Cancelling intent:", intentId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIntents((prev) => prev.filter((intent) => intent.id !== intentId));
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to cancel intent"
      );
    }
  };

  const filteredIntents = intents.filter((intent) => {
    const matchesSearch = searchQuery
      ? intent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intent.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesFilter = filterStatus ? intent.status === filterStatus : true;

    return matchesSearch && matchesFilter;
  });

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return {
    intents: filteredIntents,
    allIntents: intents,
    isLoading,
    error,
    isAuthenticated,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    createIntent,
    cancelIntent,
    getRelativeTime,
  };
}
