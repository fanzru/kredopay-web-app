"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Settings,
  Save,
  Loader2,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useProtocolSettingsAuth } from "../hooks/useProtocolSettingsAuth";

export function ProtocolSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
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
  } = useProtocolSettingsAuth();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = async () => {
    try {
      await saveSettings();
      showToast("success", "Settings saved successfully!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save settings"
      );
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await testConnection();
      setTestResult({
        success: true,
        message: `Connected! Latency: ${result.latency}ms, Block: ${result.blockHeight}`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <LogOut className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Not Authenticated
          </h2>
          <p className="text-zinc-400 mb-6">
            Please login to manage protocol settings.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Protocol Settings
          </h1>
          <p className="text-zinc-500">
            Configure your client-side ZK-Prover and network preferences.
          </p>
        </div>
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              disabled={isSaving}
            >
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="rounded-xl bg-yellow-900/10 border border-yellow-900/20 p-4">
          <p className="text-sm text-yellow-400">You have unsaved changes</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-8">
        {/* Network Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Network Connection
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting || isLoading}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Settings className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>

          {testResult && (
            <div
              className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
                testResult.success
                  ? "bg-emerald-900/10 border-emerald-900/20"
                  : "bg-red-900/10 border-red-900/20"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <p
                className={`text-sm ${
                  testResult.success ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {testResult.message}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
                  <div className="h-10 w-full bg-zinc-800/50 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  RPC Endpoint
                </label>
                <input
                  type="text"
                  value={settings.network.rpcEndpoint}
                  onChange={(e) =>
                    updateNetworkSettings({ rpcEndpoint: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Prover Node
                </label>
                <input
                  type="text"
                  value={settings.network.proverNode}
                  onChange={(e) =>
                    updateNetworkSettings({ proverNode: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Client Privacy Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Privacy & Proofs
          </h3>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-48 bg-zinc-800/50 rounded animate-pulse"></div>
                  <div className="h-6 w-11 bg-zinc-800/50 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Local Proof Generation
                  </p>
                  <p className="text-xs text-zinc-500">
                    Generate ZK proofs in-browser (slower but max privacy).
                  </p>
                </div>
                <button
                  onClick={() =>
                    updatePrivacySettings({
                      localProofGeneration:
                        !settings.privacy.localProofGeneration,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.localProofGeneration
                      ? "bg-emerald-600"
                      : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.localProofGeneration
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Auto-Obfuscate IP
                  </p>
                  <p className="text-xs text-zinc-500">
                    Route connection through Kredo Relay.
                  </p>
                </div>
                <button
                  onClick={() =>
                    updatePrivacySettings({
                      autoObfuscateIP: !settings.privacy.autoObfuscateIP,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.autoObfuscateIP
                      ? "bg-emerald-600"
                      : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.autoObfuscateIP
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
