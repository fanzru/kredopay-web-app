"use client";

import { useEffect, useState } from "react";

export type TerminalStepStatus = "queued" | "processing" | "verified" | "failed";

export interface TerminalStep {
  id: string;
  label: string;
  status: TerminalStepStatus;
  detail: string;
  updatedAt: number;
}

export interface TerminalSession {
  id: string;
  provider: string;
  status: "in_progress" | "complete" | "failed";
  createdAt: number;
  amount: number | null;
  currency: string;
  intentId: string | null;
  traceHash: string;
  etaSeconds: number;
  steps: TerminalStep[];
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

export function useSecurityTerminalAuth() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiCall("/api/security-terminal");
      setSessions(data.sessions || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch security terminal sessions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    fetchSessions();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const createSession = async (payload: {
    amount?: number;
    currency?: string;
    intentId?: string;
    provider?: string;
  }) => {
    try {
      const data = await apiCall("/api/security-terminal", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const session = data.session as TerminalSession;
      setSessions((prev) => [session, ...prev]);
      return session;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create security terminal session"
      );
    }
  };

  return {
    sessions,
    isLoading,
    error,
    isAuthenticated,
    createSession,
    refreshSessions: fetchSessions,
  };
}
