import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (name: string, limit?: number) => Promise<void>;
}

export function CreateCardModal({
  isOpen,
  onClose,
  onCreateCard,
}: CreateCardModalProps) {
  const { showToast } = useToast();

  const [newCardName, setNewCardName] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [cardType, setCardType] = useState<
    "Virtual" | "Physical" | "Disposable"
  >("Virtual");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState(() => {
    const today = new Date();
    const fiveYearsLater = new Date(today);
    fiveYearsLater.setFullYear(today.getFullYear() + 5);
    return fiveYearsLater.toISOString().split("T")[0];
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCreate = async () => {
    if (!newCardName.trim()) {
      showToast("warning", "Please enter a card name");
      return;
    }

    try {
      setIsCreating(true);
      const limit = spendingLimit ? parseFloat(spendingLimit) : undefined;
      await onCreateCard(newCardName, limit);

      // Reset form
      setNewCardName("");
      setSpendingLimit("");
      setCardType("Virtual");
      setSelectedCategories([]);
      const today = new Date();
      setValidFrom(today.toISOString().split("T")[0]);
      const fiveYearsLater = new Date(today);
      fiveYearsLater.setFullYear(today.getFullYear() + 5);
      setValidUntil(fiveYearsLater.toISOString().split("T")[0]);

      showToast("success", "Card created successfully!");
      onClose();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to create card"
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with ambient glow */}
      <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-sm">
        {/* Background Ambience */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
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
          className="relative w-full max-w-4xl my-8 pointer-events-auto"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Create Virtual Card
              </h3>
              <p className="text-base text-zinc-400">
                Set up authorization-based spending with programmable
                constraints
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT COLUMN: Core Identity & Limits */}
              <div className="space-y-6">
                {/* Card Name */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Card Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="e.g., Shopping Card, Travel Expenses"
                    className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                    disabled={isCreating}
                    autoFocus
                  />
                </div>

                {/* Card Type */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Card Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Virtual", "Physical", "Disposable"] as const).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCardType(type)}
                          className={`px-3 py-2.5 rounded-lg border text-sm transition-all ${
                            cardType === type
                              ? "border-white bg-white text-black font-semibold"
                              : "border-zinc-800 bg-black/50 text-zinc-300 hover:border-zinc-600 hover:bg-black"
                          }`}
                          disabled={isCreating}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Spending Constraints */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Daily Limit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={spendingLimit}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (!isNaN(parseFloat(value)) &&
                              parseFloat(value) >= 0)
                          ) {
                            setSpendingLimit(value);
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
                        placeholder="1000"
                        min="0"
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 pl-8 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Per Transaction
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="500"
                        min="0"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (!isNaN(parseFloat(value)) &&
                              parseFloat(value) >= 0)
                          ) {
                            // Handle per transaction limit if needed
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
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 pl-8 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                        disabled={isCreating}
                      />
                    </div>
                  </div>
                </div>

                {/* Time-Based Constraints */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Time-Based Restrictions
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        className=" rounded-lg border border-zinc-800 bg-black/50 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600 [color-scheme:dark]"
                        disabled={isCreating}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className=" rounded-lg border border-zinc-800 bg-black/50 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600 [color-scheme:dark]"
                        disabled={isCreating}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Controls & Security */}
              <div className="space-y-6">
                {/* Purpose Restrictions (Categories) */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Allowed Categories
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "Shopping",
                      "Travel",
                      "Food",
                      "Entertainment",
                      "Utilities",
                      "Subscriptions",
                    ].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-2 py-3 rounded-lg border text-xs transition-all ${
                          selectedCategories.includes(category)
                            ? "border-white bg-white text-black font-semibold"
                            : "border-zinc-800 bg-black/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                        disabled={isCreating}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Security & Privacy
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-black/30 cursor-pointer hover:border-zinc-700 hover:bg-black/50 transition-all">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isCreating}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-300">
                        Auto-freeze after inactivity
                      </p>
                      <p className="text-xs text-zinc-500">
                        Freeze card after 30 days of no usage
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-black/30 cursor-pointer hover:border-zinc-700 hover:bg-black/50 transition-all">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isCreating}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-300">
                        Require 2FA for transactions
                      </p>
                      <p className="text-xs text-zinc-500">
                        Extra security for high-value purchases
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-black/30 cursor-pointer hover:border-zinc-700 hover:bg-black/50 transition-all">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isCreating}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-300">
                        Enable instant notifications
                      </p>
                      <p className="text-xs text-zinc-500">
                        Get notified for every transaction
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
              {/* Authorization Note */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <p className="text-sm text-indigo-300 leading-relaxed">
                  <span className="font-semibold">
                    Authorization-Based Security:
                  </span>{" "}
                  This card uses Kredo's accountless architecture. Spending is
                  validated through cryptographic permissions, not balance
                  ownership.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
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
                  disabled={isCreating || !newCardName.trim()}
                  className="flex-1 h-11 bg-white text-black hover:bg-zinc-200 border-0 font-medium text-base"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Card
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
