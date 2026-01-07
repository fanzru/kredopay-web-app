import React, { useState } from "react";
import { Users, Loader2, X, Sparkles, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { RolePolicy } from "../hooks/usePermissionsAuth";

interface CreateRolePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePolicy: (
    name: string,
    accessLevel: RolePolicy["accessLevel"],
    dailyLimit?: number,
    description?: string
  ) => Promise<void>;
}

interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  accessLevel: RolePolicy["accessLevel"];
  dailyLimit?: number;
  icon: React.ReactNode;
}

const policyTemplates: PolicyTemplate[] = [
  {
    id: "admin",
    name: "Admin Role",
    description: "Full access to all spending intents and permissions",
    accessLevel: "full",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "ai-agents",
    name: "AI Agents",
    description: "Automated agents with strict daily spending limits",
    accessLevel: "limited",
    dailyLimit: 50,
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "team",
    name: "Team Members",
    description: "Standard team access with moderate limits",
    accessLevel: "limited",
    dailyLimit: 200,
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "contractor",
    name: "Contractors",
    description: "Limited access for external contractors",
    accessLevel: "limited",
    dailyLimit: 100,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "restricted",
    name: "Restricted Access",
    description: "Minimal access with very strict limits",
    accessLevel: "restricted",
    dailyLimit: 25,
    icon: <Shield className="h-4 w-4" />,
  },
];

export function CreateRolePolicyModal({
  isOpen,
  onClose,
  onCreatePolicy,
}: CreateRolePolicyModalProps) {
  const { showToast } = useToast();

  const [policyName, setPolicyName] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] =
    useState<RolePolicy["accessLevel"]>("limited");
  const [dailyLimit, setDailyLimit] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = (template: PolicyTemplate) => {
    setSelectedTemplate(template.id);
    setPolicyName(template.name);
    setDescription(template.description);
    setAccessLevel(template.accessLevel);
    setDailyLimit(template.dailyLimit?.toString() || "");
  };

  const handleCreate = async () => {
    if (!policyName.trim()) {
      showToast("warning", "Please enter a policy name");
      return;
    }

    if (accessLevel === "limited" && !dailyLimit) {
      showToast("warning", "Please enter a daily limit for limited access");
      return;
    }

    if (accessLevel === "limited" && parseFloat(dailyLimit) <= 0) {
      showToast("warning", "Daily limit must be greater than 0");
      return;
    }

    try {
      setIsCreating(true);
      const limit =
        accessLevel === "limited" ? parseFloat(dailyLimit) : undefined;
      await onCreatePolicy(policyName, accessLevel, limit, description);

      // Reset form
      setPolicyName("");
      setDescription("");
      setAccessLevel("limited");
      setDailyLimit("");
      setSelectedTemplate(null);

      showToast("success", "Role policy created successfully!");
      onClose();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create policy"
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
        </div>
        <div
          className="absolute inset-0"
          onClick={() => !isCreating && onClose()}
        />
      </div>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-3xl my-8 pointer-events-auto"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Create Role Policy
                </h3>
                <p className="text-sm text-zinc-400">
                  Define who can spend what, when, and where
                </p>
              </div>
              <button
                onClick={() => !isCreating && onClose()}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                disabled={isCreating}
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {policyTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedTemplate === template.id
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`p-1.5 rounded ${
                            selectedTemplate === template.id
                              ? "bg-indigo-500/20 text-indigo-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {template.icon}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {template.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {template.description}
                      </p>
                      {template.dailyLimit && (
                        <p className="text-xs text-indigo-400 mt-1">
                          ${template.dailyLimit}/day
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Policy Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Engineering Team, Marketing Budget"
                  className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                  disabled={isCreating}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose and scope of this policy..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600 resize-none"
                  disabled={isCreating}
                />
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Access Level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      {
                        value: "full",
                        label: "Full Access",
                        desc: "No limits",
                      },
                      {
                        value: "limited",
                        label: "Limited",
                        desc: "With constraints",
                      },
                      {
                        value: "restricted",
                        label: "Restricted",
                        desc: "Minimal access",
                      },
                    ] as const
                  ).map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setAccessLevel(level.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        accessLevel === level.value
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      <div className="text-sm font-medium text-white mb-1">
                        {level.label}
                      </div>
                      <div className="text-xs text-zinc-500">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Limit (only for limited/restricted) */}
              {(accessLevel === "limited" || accessLevel === "restricted") && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Daily Spending Limit <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                        ) {
                          setDailyLimit(value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-zinc-800 bg-black/50 pl-8 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                      disabled={isCreating}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Maximum amount that can be spent per day under this policy
                  </p>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <p className="text-sm text-indigo-300 leading-relaxed">
                  <span className="font-semibold">Authorization-Based:</span>{" "}
                  This policy uses Kredo's accountless architecture. Spending is
                  validated through cryptographic permissions, not balance
                  ownership.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => !isCreating && onClose()}
                  disabled={isCreating}
                  className="flex-1 h-11 text-base bg-transparent border-zinc-700 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    !policyName.trim() ||
                    (accessLevel !== "full" && !dailyLimit)
                  }
                  className="flex-1 h-11 bg-white text-black hover:bg-zinc-200 border-0 font-medium text-base"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Create Policy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
