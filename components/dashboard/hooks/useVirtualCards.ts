"use client";

import { useState, useEffect } from "react";

export interface VirtualCard {
  id: string;
  name: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
  balance: number;
  currency: string;
  status: "active" | "frozen" | "expired";
  created_at: number;
  last_used?: number;
  spending_limit?: number;
}

export interface Transaction {
  id: string;
  card_id: string;
  type: "payment" | "refund" | "topup";
  amount: number;
  merchant: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
}

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

const getUserEmail = (): string => {
  if (typeof window === "undefined") return "user@kredopay.app";
  return localStorage.getItem("kredo_user_email") || "user@kredopay.app";
};

// API helper
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const userEmail = getUserEmail();
  const token = localStorage.getItem("kredo_auth_token");

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-User-Email": userEmail,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

export function useVirtualCards() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load cards from API
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setCards([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch cards from API
        const data = await apiCall("/api/cards");
        setCards(data.cards || []);

        // TODO: Fetch transactions from API
        // For now, keep empty
        setTransactions([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cards");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const createCard = async (name: string, spendingLimit?: number) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      const data = await apiCall("/api/cards", {
        method: "POST",
        body: JSON.stringify({ name, spendingLimit }),
      });

      setCards((prev) => [data.card, ...prev]);
      return data.card;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create card"
      );
    }
  };

  const updateCard = async (cardId: string, updates: Partial<VirtualCard>) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      const data = await apiCall(`/api/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setCards((prev) =>
        prev.map((card) => (card.id === cardId ? data.card : card))
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update card"
      );
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      await apiCall(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setTransactions((prev) => prev.filter((tx) => tx.card_id !== cardId));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete card"
      );
    }
  };

  const freezeCard = async (cardId: string) => {
    await updateCard(cardId, { status: "frozen" });
  };

  const unfreezeCard = async (cardId: string) => {
    await updateCard(cardId, { status: "active" });
  };

  const topUpCard = async (cardId: string, amount: number) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual top-up transaction
      const card = cards.find((c) => c.id === cardId);
      if (!card) throw new Error("Card not found");

      await updateCard(cardId, {
        balance: card.balance + amount,
        last_used: Date.now(),
      });

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to top up card"
      );
    }
  };

  const getTotalBalance = () => {
    return cards.reduce((sum, card) => sum + card.balance, 0);
  };

  const getActiveCardsCount = () => {
    return cards.filter((card) => card.status === "active").length;
  };

  return {
    cards,
    transactions,
    isLoading,
    error,
    isAuthenticated,
    createCard,
    updateCard,
    deleteCard,
    freezeCard,
    unfreezeCard,
    topUpCard,
    getTotalBalance,
    getActiveCardsCount,
  };
}
