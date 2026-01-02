"use client";

import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Snowflake,
  Sun,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wifi,
} from "lucide-react";
import { motion } from "framer-motion";
import type { VirtualCard } from "../hooks/useVirtualCards";
import { useToast } from "@/components/ui/Toast";

interface VirtualCardItemProps {
  card: VirtualCard;
  onUpdate: (cardId: string, updates: Partial<VirtualCard>) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onFreeze: (cardId: string) => Promise<void>;
  onUnfreeze: (cardId: string) => Promise<void>;
}

export function VirtualCardItem({
  card,
  onUpdate,
  onDelete,
  onFreeze,
  onUnfreeze,
}: VirtualCardItemProps) {
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(card.name);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update editName when card.name changes (e.g., after rename)
  useEffect(() => {
    setEditName(card.name);
  }, [card.name]);

  // Debug: Log card status changes
  useEffect(() => {
    console.log(
      "Card status:",
      card.status,
      "Lowercase:",
      card.status?.toLowerCase()
    );
  }, [card.status]);

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      showToast("error", "Card name cannot be empty");
      return;
    }

    if (editName === card.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsProcessing(true);
      await onUpdate(card.id, { name: editName.trim() });
      setIsEditing(false);
      showToast("success", "Card renamed successfully");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update card"
      );
      // Revert to original name on error
      setEditName(card.name);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete card "${card.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      await onDelete(card.id);
      showToast("success", "Card deleted successfully");
      setShowMenu(false);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to delete card"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFreeze = async () => {
    try {
      setIsProcessing(true);
      const currentStatus = card.status?.toLowerCase();

      if (currentStatus === "frozen") {
        await onUnfreeze(card.id);
        showToast("success", "Card unfrozen successfully");
      } else {
        await onFreeze(card.id);
        showToast("success", "Card frozen successfully");
      }
      setShowMenu(false);
    } catch (err) {
      console.error("Freeze/unfreeze error:", err);
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update card status"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle both camelCase and snake_case field names, with fallback
  const cardNumber =
    card.card_number || (card as any).cardNumber || "0000 0000 0000 0000";
  const expiryDate = (card as any).expiryDate || card.expiry_date || "MM/YY";
  const cvv = card.cvv || "";

  const maskedCardNumber = cardNumber
    .split(" ")
    .map((part: string, i: number) => (i < 3 ? "••••" : part))
    .join(" ");

  const cardNumberDisplay = showCardNumber ? cardNumber : maskedCardNumber;

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative group w-full aspect-[1.586/1] perspective-1000 ${
        card.status?.toLowerCase() === "frozen" ? "grayscale opacity-80" : ""
      }`}
    >
      {/* Physical Card Container */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500
          bg-zinc-900 border border-white/10
          ${card.status === "expired" ? "opacity-60" : ""}
        `}
        style={{
          boxShadow:
            "0 40px 80px -15px rgba(0, 0, 0, 0.7), inset 0 0 0 1.5px rgba(255,255,255,0.08)",
        }}
      >
        {/* Background Styling */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black" />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.2] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        {/* Premium Glows */}
        <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-purple-500/10 blur-[100px] rounded-full" />

        {/* Dynamic Light Reflection */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out" />
        </div>

        <div className="relative w-full h-full p-5 flex flex-col justify-between">
          {/* Top Row: Brand & Actions */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <span className="text-white font-extrabold text-lg tracking-tight font-sans">
                Kredo<span className="text-indigo-400">Pay</span>
              </span>
              <span className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
                Platinum Business
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-white/20 rotate-90" />

              <div className="relative z-30">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors relative z-30"
                  aria-label="Card options"
                >
                  <MoreVertical className="h-5 w-5 text-white/40" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-10 z-30 w-44 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl p-1.5">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        disabled={isProcessing}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit2 className="h-4 w-4" />
                        Rename Card
                      </button>
                      <button
                        onClick={handleToggleFreeze}
                        disabled={isProcessing}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {card.status?.toLowerCase() === "frozen" ? (
                          <>
                            <Sun className="h-4 w-4" />
                            Unfreeze Card
                          </>
                        ) : (
                          <>
                            <Snowflake className="h-4 w-4" />
                            Freeze Card
                          </>
                        )}
                      </button>
                      <div className="h-px bg-zinc-800 my-1 mx-1" />
                      <button
                        onClick={handleDelete}
                        disabled={isProcessing}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Card
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Chip & Card Number */}
          <div className="flex flex-col gap-3">
            {/* Holographic Chip */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 relative overflow-hidden border border-yellow-600/20 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.6)_50%,transparent_55%)] opacity-50" />
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[1px] opacity-30 mix-blend-multiply">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-black/20" />
                ))}
              </div>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between group/number">
              <p className="font-mono text-base md:text-lg text-white tracking-[0.15em] drop-shadow-lg font-medium">
                {cardNumberDisplay}
              </p>

              <div className="flex items-center gap-2 opacity-0 group-hover/number:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  {showCardNumber ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={copyCardNumber}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Details & Logo */}
          <div className="flex items-end justify-between">
            <div className="flex gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">
                  Card Holder
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                      if (e.key === "Escape") {
                        setEditName(card.name);
                        setIsEditing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="bg-transparent border-b border-white/20 text-xs text-white focus:outline-none focus:border-white/50 font-semibold uppercase tracking-widest w-24 disabled:opacity-50"
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-xs font-semibold uppercase tracking-widest truncate max-w-[120px]">
                    {card.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">
                  Expires
                </span>
                <p className="text-white text-xs font-mono tracking-widest font-semibold">
                  {expiryDate}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="h-4 w-auto brightness-0 invert opacity-90"
              />
              <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-white/80 text-[9px] font-bold tracking-tight">
                  $
                  {(typeof card.balance === "number"
                    ? card.balance
                    : parseFloat(String(card.balance)) || 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Frozen Overlay */}
        {card.status?.toLowerCase() === "frozen" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="px-6 py-3 rounded-2xl bg-zinc-900/90 border border-white/10 text-white flex items-center gap-3 shadow-2xl">
                <Snowflake className="w-5 h-5 text-blue-400" />
                <span className="text-base font-bold tracking-wide uppercase">
                  Frozen
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFreeze();
                }}
                className="text-xs text-white/70 hover:text-white hover:underline transition-colors"
              >
                Click to Unfreeze
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
