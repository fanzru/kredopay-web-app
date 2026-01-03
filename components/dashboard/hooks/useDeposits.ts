"use client";

import { useState, useEffect } from "react";

export interface DepositRequest {
  id: string;
  userEmail: string;
  requestedAmount?: string;
  exactAmount?: string;
  amount: string; // For backward compatibility
  currency: string;
  uniqueCode: string;
  walletAddress: string;
  status: "pending" | "completed" | "failed" | "expired";
  cardId: string | null;
  createdAt: number;
  expiresAt: number;
  completedAt: number | null;
  transactionHash: string | null;
  decimalCode?: string; // The 3-digit decimal code
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

export function useDeposits() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load deposits from API
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setDeposits([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch deposits from API
        const data = await apiCall("/api/deposits");
        const deposits = (data.deposits || []).map((deposit: any) => ({
          id: deposit.id,
          userEmail: deposit.userEmail || deposit.user_email,
          requestedAmount: deposit.requestedAmount || deposit.requested_amount || deposit.amount,
          exactAmount: deposit.exactAmount || deposit.exact_amount || deposit.amount,
          amount: deposit.exactAmount || deposit.exact_amount || deposit.amount, // For backward compatibility
          currency: deposit.currency || "USDC",
          uniqueCode: deposit.uniqueCode || deposit.unique_code,
          walletAddress: deposit.walletAddress || deposit.wallet_address,
          status: deposit.status || "pending",
          cardId: deposit.cardId || deposit.card_id,
          createdAt: deposit.createdAt || deposit.created_at,
          expiresAt: deposit.expiresAt || deposit.expires_at,
          completedAt: deposit.completedAt || deposit.completed_at,
          transactionHash: deposit.transactionHash || deposit.transaction_hash,
          decimalCode: deposit.decimalCode,
        }));
        setDeposits(deposits);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deposits");
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

  const refreshDeposits = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiCall("/api/deposits");
      const deposits = (data.deposits || []).map((deposit: any) => ({
        id: deposit.id,
        userEmail: deposit.userEmail || deposit.user_email,
        requestedAmount: deposit.requestedAmount || deposit.requested_amount || deposit.amount,
        exactAmount: deposit.exactAmount || deposit.exact_amount || deposit.amount,
        amount: deposit.exactAmount || deposit.exact_amount || deposit.amount, // For backward compatibility
        currency: deposit.currency || "USDC",
        uniqueCode: deposit.uniqueCode || deposit.unique_code,
        walletAddress: deposit.walletAddress || deposit.wallet_address,
        status: deposit.status || "pending",
        cardId: deposit.cardId || deposit.card_id,
        createdAt: deposit.createdAt || deposit.created_at,
        expiresAt: deposit.expiresAt || deposit.expires_at,
        completedAt: deposit.completedAt || deposit.completed_at,
        transactionHash: deposit.transactionHash || deposit.transaction_hash,
        decimalCode: deposit.decimalCode,
      }));
      setDeposits(deposits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh deposits");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deposits,
    isLoading,
    error,
    isAuthenticated,
    refreshDeposits,
  };
}

