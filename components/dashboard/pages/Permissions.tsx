"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldCheck,
  Plus,
  Lock,
  Users,
  Loader2,
  LogOut,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { usePermissionsAuth } from "../hooks/usePermissionsAuth";
import { CreateRolePolicyModal } from "../components/CreateRolePolicyModal";
import { CreateGlobalConstraintModal } from "../components/CreateGlobalConstraintModal";

export function Permissions() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    rolePolicies,
    globalConstraints,
    isLoading,
    error,
    isAuthenticated,
    toggleConstraint,
    createRolePolicy,
    createGlobalConstraint,
  } = usePermissionsAuth();

  const [togglingConstraint, setTogglingConstraint] = useState<string | null>(
    null
  );
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConstraintModal, setShowConstraintModal] = useState(false);

  const handleToggleConstraint = async (constraintId: string) => {
    try {
      setTogglingConstraint(constraintId);
      await toggleConstraint(constraintId);
      showToast("success", "Constraint updated successfully");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to toggle constraint"
      );
    } finally {
      setTogglingConstraint(null);
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
            Please login to manage permissions.
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
            Access Permissions
          </h1>
          <p className="text-zinc-500">
            Define who can spend what, when, and where.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConstraintModal(true)}
          >
            <Lock className="mr-2 h-4 w-4" /> New Constraint
          </Button>
          <Button size="sm" onClick={() => setShowRoleModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Policy
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/10 border border-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Role Based Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-900/20 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Role-Based Policies
            </h3>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-400">
              Manage permissions for teams and groups (e.g., "Engineering Team",
              "Marketing Budget").
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRoleModal(true)}
              className="shrink-0"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <div className="h-4 w-32 bg-zinc-800/50 rounded animate-pulse"></div>
                </div>
              ))
            ) : rolePolicies.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No role policies yet</p>
              </div>
            ) : (
              rolePolicies.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-300">
                      {role.name}
                    </span>
                    {role.dailyLimit && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        ${role.dailyLimit}/day limit
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      role.accessLevel === "full"
                        ? "text-emerald-500"
                        : role.accessLevel === "limited"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {role.accessLevel === "full"
                      ? "Full Access"
                      : role.accessLevel === "limited"
                      ? `$${role.dailyLimit}/day Limit`
                      : "Restricted"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Constraints Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-900/20 text-rose-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Global Constraints
            </h3>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-400">
              Safety rules that apply to all spending intents under this
              account.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConstraintModal(true)}
              className="shrink-0"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <div className="h-4 w-40 bg-zinc-800/50 rounded animate-pulse"></div>
                </div>
              ))
            ) : globalConstraints.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">
                  No constraints configured
                </p>
              </div>
            ) : (
              globalConstraints.map((constraint) => (
                <div
                  key={constraint.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-300">
                      {constraint.name}
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {constraint.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleConstraint(constraint.id)}
                    disabled={togglingConstraint === constraint.id}
                    className="ml-3 flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    {togglingConstraint === constraint.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    ) : constraint.enabled ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-emerald-500" />
                        <span className="text-emerald-500">Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-zinc-600" />
                        <span className="text-zinc-500">Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateRolePolicyModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onCreatePolicy={async (name, accessLevel, dailyLimit, description) => {
          await createRolePolicy(name, accessLevel, dailyLimit);
          showToast("success", "Role policy created successfully!");
        }}
      />

      <CreateGlobalConstraintModal
        isOpen={showConstraintModal}
        onClose={() => setShowConstraintModal(false)}
        onCreateConstraint={async (name, value, description, enabled) => {
          await createGlobalConstraint(name, value, description, enabled);
          showToast("success", "Global constraint created successfully!");
        }}
      />
    </div>
  );
}
