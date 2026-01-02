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

        // Get auth token and email
        const token = localStorage.getItem("kredo_auth_token");
        const email = localStorage.getItem("kredo_user_email");

        if (!token || !email) {
          setIntents([]);
          setIsLoading(false);
          return;
        }

        // Fetch real intents from API
        const response = await fetch("/api/intents", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": email,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch intents");
        }

        const data = await response.json();

        // Convert date strings back to Date objects
        const intentsWithDates = data.intents.map((intent: any) => ({
          ...intent,
          createdAt: new Date(intent.createdAt),
          updatedAt: intent.updatedAt ? new Date(intent.updatedAt) : null,
          executedAt: intent.executedAt ? new Date(intent.executedAt) : null,
        }));

        setIntents(intentsWithDates);
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
      const token = localStorage.getItem("kredo_auth_token");
      const email = localStorage.getItem("kredo_user_email");

      if (!token || !email) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
        },
        body: JSON.stringify({
          type,
          amount,
          description,
          merchant,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create intent");
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const newIntent: SpendingIntent = {
        ...data.intent,
        createdAt: new Date(data.intent.createdAt),
        updatedAt: data.intent.updatedAt
          ? new Date(data.intent.updatedAt)
          : null,
        executedAt: data.intent.executedAt
          ? new Date(data.intent.executedAt)
          : null,
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
      const token = localStorage.getItem("kredo_auth_token");
      const email = localStorage.getItem("kredo_user_email");

      if (!token || !email) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/intents/${intentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel intent");
      }

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
