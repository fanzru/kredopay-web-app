"use client";

import { useState, useEffect } from "react";

export interface SessionInfo {
  sessionId: string;
  email: string;
  expiresAt: Date;
  isAnonymous: boolean;
}

export interface ProofStatus {
  label: string;
  status: "verified" | "pending" | "expired";
  lastVerified: Date;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: "laptop" | "mobile" | "tablet";
  location: string;
  browser: string;
  isCurrent: boolean;
  lastActive: Date;
}

// Helper to check if user is authenticated
const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

// Helper to get user email from token (mock implementation)
const getUserEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  // In real implementation, decode JWT token
  // For now, get from localStorage if available
  return localStorage.getItem("kredo_user_email") || "user@kredopay.app";
};

export function useIdentityAuth() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [proofStatuses, setProofStatuses] = useState<ProofStatus[]>([]);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
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
      setSession(null);
      setProofStatuses([]);
      setDevices([]);
      setIsLoading(false);
      return;
    }

    const fetchIdentityData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to Kredo backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userEmail = getUserEmail() || "user@kredopay.app";

        // Generate session ID from email (ephemeral)
        const sessionId =
          userEmail.split("@")[0].slice(0, 4) +
          "..." +
          Math.random().toString(16).slice(2, 6);

        // Simulated session data
        const sessionData: SessionInfo = {
          sessionId,
          email: userEmail,
          expiresAt: new Date(Date.now() + 3.75 * 60 * 60 * 1000), // 3h 45m from now
          isAnonymous: true,
        };

        // Simulated proof statuses
        const proofs: ProofStatus[] = [
          {
            label: "Solvency Proof",
            status: "verified",
            lastVerified: new Date(),
          },
          {
            label: "Clean Wallet (AML)",
            status: "verified",
            lastVerified: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            label: "Humanity Check",
            status: "pending",
            lastVerified: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ];

        // Detect current device info
        const userAgent = navigator.userAgent;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
        const isTablet =
          /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);

        let deviceType: "laptop" | "mobile" | "tablet" = "laptop";
        let deviceName = "Desktop Computer";

        if (isTablet) {
          deviceType = "tablet";
          deviceName = "Tablet";
        } else if (isMobile) {
          deviceType = "mobile";
          deviceName = "Mobile Phone";
        } else if (userAgent.includes("Mac")) {
          deviceName = "MacBook Pro";
        } else if (userAgent.includes("Windows")) {
          deviceName = "Windows PC";
        }

        const browser = userAgent.includes("Chrome")
          ? "Chrome"
          : userAgent.includes("Safari")
          ? "Safari"
          : userAgent.includes("Firefox")
          ? "Firefox"
          : "Browser";

        // Simulated device sessions
        const deviceSessions: DeviceSession[] = [
          {
            id: "device-current",
            deviceName,
            deviceType,
            location: "Singapore, SG",
            browser,
            isCurrent: true,
            lastActive: new Date(),
          },
          {
            id: "device-2",
            deviceName: "iPhone 15 Pro",
            deviceType: "mobile",
            location: "Singapore, SG",
            browser: "Safari",
            isCurrent: false,
            lastActive: new Date(Date.now() - 30 * 60 * 1000),
          },
        ];

        setSession(sessionData);
        setProofStatuses(proofs);
        setDevices(deviceSessions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch identity data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdentityData();

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const rotateKeys = async () => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement key rotation logic
      console.log("Rotating session keys");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Key rotation failed"
      );
    }
  };

  const generateNewProof = async (proofType: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement ZK proof generation
      console.log("Generating new proof:", proofType);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Proof generation failed"
      );
    }
  };

  const revokeDevice = async (deviceId: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement device revocation
      console.log("Revoking device:", deviceId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update devices list
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Device revocation failed"
      );
    }
  };

  const getTimeUntilExpiry = () => {
    if (!session) return null;

    const now = new Date();
    const diff = session.expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return {
    session,
    proofStatuses,
    devices,
    isLoading,
    error,
    isAuthenticated,
    rotateKeys,
    generateNewProof,
    revokeDevice,
    getTimeUntilExpiry,
  };
}
