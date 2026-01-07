import React, { useState } from "react";
import {
  Lock,
  Loader2,
  X,
  DollarSign,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { GlobalConstraint } from "../hooks/usePermissionsAuth";

interface CreateGlobalConstraintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConstraint: (
    name: string,
    value: string | number | boolean,
    description: string,
    enabled?: boolean
  ) => Promise<void>;
}

interface ConstraintTemplate {
  id: string;
  name: string;
  description: string;
  type: "number" | "boolean" | "string" | "time" | "geo";
  defaultValue: string | number | boolean;
  icon: React.ReactNode;
  placeholder?: string;
  unit?: string;
}

const constraintTemplates: ConstraintTemplate[] = [
  {
    id: "max-transaction",
    name: "Max Transaction Size",
    description: "Maximum amount per single transaction",
    type: "number",
    defaultValue: 1000,
    icon: <DollarSign className="h-4 w-4" />,
    placeholder: "1000",
    unit: "USD",
  },
  {
    id: "max-daily",
    name: "Max Daily Spending",
    description: "Maximum total spending per day across all intents",
    type: "number",
    defaultValue: 5000,
    icon: <DollarSign className="h-4 w-4" />,
    placeholder: "5000",
    unit: "USD",
  },
  {
    id: "max-monthly",
    name: "Max Monthly Spending",
    description: "Maximum total spending per month",
    type: "number",
    defaultValue: 50000,
    icon: <DollarSign className="h-4 w-4" />,
    placeholder: "50000",
    unit: "USD",
  },
  {
    id: "approved-merchants",
    name: "Approved Merchants Only",
    description: "Only allow transactions with pre-approved merchants",
    type: "boolean",
    defaultValue: true,
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "time-window",
    name: "Time Window Restriction",
    description:
      "Restrict spending to specific time windows (e.g., 9AM-6PM UTC)",
    type: "time",
    defaultValue: "9AM-6PM UTC",
    icon: <Clock className="h-4 w-4" />,
    placeholder: "9AM-6PM UTC",
  },
  {
    id: "geo-fence",
    name: "Geographic Restriction",
    description: "Limit transactions to specific regions (comma-separated)",
    type: "geo",
    defaultValue: "US, EU, Singapore",
    icon: <MapPin className="h-4 w-4" />,
    placeholder: "US, EU, Singapore",
  },
  {
    id: "require-2fa",
    name: "Require 2FA for High-Value",
    description:
      "Require two-factor authentication for transactions above threshold",
    type: "number",
    defaultValue: 500,
    icon: <Shield className="h-4 w-4" />,
    placeholder: "500",
    unit: "USD",
  },
];

export function CreateGlobalConstraintModal({
  isOpen,
  onClose,
  onCreateConstraint,
}: CreateGlobalConstraintModalProps) {
  const { showToast } = useToast();

  const [constraintName, setConstraintName] = useState("");
  const [description, setDescription] = useState("");
  const [constraintType, setConstraintType] = useState<
    "number" | "boolean" | "string" | "time" | "geo"
  >("number");
  const [numberValue, setNumberValue] = useState("");
  const [stringValue, setStringValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ConstraintTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = (template: ConstraintTemplate) => {
    setSelectedTemplate(template);
    setConstraintName(template.name);
    setDescription(template.description);
    setConstraintType(template.type);

    if (template.type === "number") {
      setNumberValue(template.defaultValue.toString());
    } else if (template.type === "boolean") {
      setBooleanValue(template.defaultValue as boolean);
    } else {
      setStringValue(template.defaultValue.toString());
    }
  };

  const getCurrentValue = (): string | number | boolean => {
    if (constraintType === "number") {
      return parseFloat(numberValue) || 0;
    } else if (constraintType === "boolean") {
      return booleanValue;
    } else {
      return stringValue;
    }
  };

  const handleCreate = async () => {
    if (!constraintName.trim()) {
      showToast("warning", "Please enter a constraint name");
      return;
    }

    if (!description.trim()) {
      showToast("warning", "Please enter a description");
      return;
    }

    if (constraintType === "number" && !numberValue) {
      showToast("warning", "Please enter a value");
      return;
    }

    if (
      (constraintType === "string" ||
        constraintType === "time" ||
        constraintType === "geo") &&
      !stringValue.trim()
    ) {
      showToast("warning", "Please enter a value");
      return;
    }

    try {
      setIsCreating(true);
      const value = getCurrentValue();
      await onCreateConstraint(constraintName, value, description, true);

      // Reset form
      setConstraintName("");
      setDescription("");
      setConstraintType("number");
      setNumberValue("");
      setStringValue("");
      setBooleanValue(true);
      setSelectedTemplate(null);

      showToast("success", "Global constraint created successfully!");
      onClose();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create constraint"
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
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/10 blur-[120px]" />
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
                  Create Global Constraint
                </h3>
                <p className="text-sm text-zinc-400">
                  Safety rules that apply to all spending intents
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {constraintTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-rose-500 bg-rose-500/10"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`p-1.5 rounded ${
                            selectedTemplate?.id === template.id
                              ? "bg-rose-500/20 text-rose-400"
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Constraint Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Constraint Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={constraintName}
                  onChange={(e) => setConstraintName(e.target.value)}
                  placeholder="e.g., Max Transaction Size, Time Window"
                  className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                  disabled={isCreating}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this constraint does and when it applies..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600 resize-none"
                  disabled={isCreating}
                />
              </div>

              {/* Constraint Type */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Constraint Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(
                    [
                      { value: "number", label: "Number" },
                      { value: "boolean", label: "Boolean" },
                      { value: "string", label: "String" },
                      { value: "time", label: "Time" },
                      { value: "geo", label: "Geo" },
                    ] as const
                  ).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setConstraintType(type.value)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        constraintType === type.value
                          ? "border-rose-500 bg-rose-500/10 text-white"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Input based on type */}
              {constraintType === "number" && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Value <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={numberValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                        ) {
                          setNumberValue(value);
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
                      placeholder={selectedTemplate?.placeholder || "0.00"}
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-zinc-800 bg-black/50 pl-8 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              )}

              {constraintType === "boolean" && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Value <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setBooleanValue(true)}
                      className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        booleanValue
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setBooleanValue(false)}
                      className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        !booleanValue
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                      }`}
                      disabled={isCreating}
                    >
                      Disabled
                    </button>
                  </div>
                </div>
              )}

              {(constraintType === "string" ||
                constraintType === "time" ||
                constraintType === "geo") && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Value <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={stringValue}
                    onChange={(e) => setStringValue(e.target.value)}
                    placeholder={
                      selectedTemplate?.placeholder || constraintType === "time"
                        ? "9AM-6PM UTC"
                        : constraintType === "geo"
                        ? "US, EU, Singapore"
                        : "Enter value"
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                    disabled={isCreating}
                  />
                  {constraintType === "time" && (
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Format: 9AM-6PM UTC or HH:MM-HH:MM
                    </p>
                  )}
                  {constraintType === "geo" && (
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Comma-separated list of regions (e.g., US, EU, Singapore)
                    </p>
                  )}
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                <p className="text-sm text-rose-300 leading-relaxed">
                  <span className="font-semibold">Global Constraint:</span> This
                  rule applies to all spending intents under your account. You
                  can enable or disable it at any time without affecting
                  individual role policies.
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
                    !constraintName.trim() ||
                    !description.trim() ||
                    (constraintType === "number" && !numberValue) ||
                    ((constraintType === "string" ||
                      constraintType === "time" ||
                      constraintType === "geo") &&
                      !stringValue.trim())
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
                      <Lock className="mr-2 h-5 w-5" />
                      Create Constraint
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
