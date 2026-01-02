"use client";

import { useState, useEffect } from "react";

export interface NetworkSettings {
  rpcEndpoint: string;
  proverNode: string;
  networkName: string;
}

export interface PrivacySettings {
  localProofGeneration: boolean;
  autoObfuscateIP: boolean;
  useRelayNetwork: boolean;
}

export interface ProtocolSettings {
  network: NetworkSettings;
  privacy: PrivacySettings;
}

const DEFAULT_SETTINGS: ProtocolSettings = {
  network: {
    rpcEndpoint: "https://rpc.kredo-testnet.com",
    proverNode: "wss://prover-01.kredo.org",
    networkName: "Kredo Testnet",
  },
  privacy: {
    localProofGeneration: true,
    autoObfuscateIP: false,
    useRelayNetwork: false,
  },
};

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

const getUserEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kredo_user_email") || "user@kredopay.app";
};

export function useProtocolSettingsAuth() {
  const [settings, setSettings] = useState<ProtocolSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to load user settings
        // For now, load from localStorage
        await new Promise((resolve) => setTimeout(resolve, 400));

        const userEmail = getUserEmail();
        const savedSettings = localStorage.getItem(
          `kredo-settings-${userEmail}`
        );
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateNetworkSettings = (updates: Partial<NetworkSettings>) => {
    setSettings((prev) => ({
      ...prev,
      network: { ...prev.network, ...updates },
    }));
    setHasUnsavedChanges(true);
  };

  const updatePrivacySettings = (updates: Partial<PrivacySettings>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates },
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      setIsSaving(true);
      setError(null);

      // TODO: Replace with actual API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage for now
      const userEmail = getUserEmail();
      localStorage.setItem(
        `kredo-settings-${userEmail}`,
        JSON.stringify(settings)
      );

      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasUnsavedChanges(true);
  };

  const testConnection = async () => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual connection test
      console.log("Testing connection to:", settings.network.rpcEndpoint);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate connection test
      const isConnected = Math.random() > 0.1; // 90% success rate

      if (!isConnected) {
        throw new Error("Connection test failed");
      }

      return {
        success: true,
        latency: Math.floor(Math.random() * 200) + 50, // 50-250ms
        blockHeight: Math.floor(Math.random() * 1000000),
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Connection test failed"
      );
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    isAuthenticated,
    updateNetworkSettings,
    updatePrivacySettings,
    saveSettings,
    resetToDefaults,
    testConnection,
  };
}
