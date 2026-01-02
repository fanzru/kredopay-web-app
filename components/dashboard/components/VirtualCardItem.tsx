"use client";

import React, { useState } from "react";
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

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    try {
      setIsProcessing(true);
      await onUpdate(card.id, { name: editName });
      setIsEditing(false);
      showToast("success", "Card renamed successfully");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update card"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete card "${card.name}"?`)) return;

    try {
      setIsProcessing(true);
      await onDelete(card.id);
      showToast("success", "Card deleted successfully");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to delete card"
      );
      setIsProcessing(false);
    }
  };

  const handleToggleFreeze = async () => {
    try {
      setIsProcessing(true);
      if (card.status === "frozen") {
        await onUnfreeze(card.id);
        showToast("success", "Card unfrozen");
      } else {
        await onFreeze(card.id);
        showToast("success", "Card frozen");
      }
      setShowMenu(false);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update card status"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(card.card_number.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedCardNumber = card.card_number
    .split(" ")
    .map((part, i) => (i < 3 ? "••••" : part))
    .join(" ");

  const cardNumberDisplay = showCardNumber
    ? card.card_number
    : maskedCardNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative group h-[320px] perspective-1000 ${
        card.status === "frozen" ? "grayscale opacity-80" : ""
      }`}
    >
      {/* Physical Card Container */}
      <div
        className={`relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500
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

        <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between">
          {/* Top Row: Brand & Actions */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <span className="text-white font-extrabold text-2xl tracking-tight font-sans">
                Kredo<span className="text-indigo-400">Pay</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
                Platinum Business
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Wifi className="w-7 h-7 text-white/20 rotate-90" />

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <MoreVertical className="h-6 w-6 text-white/40" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl p-1.5">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Rename Card
                      </button>
                      <button
                        onClick={handleToggleFreeze}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors"
                      >
                        {card.status === "frozen" ? (
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
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
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
          <div className="flex flex-col gap-6">
            {/* Holographic Chip */}
            <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 relative overflow-hidden border border-yellow-600/20 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.6)_50%,transparent_55%)] opacity-50" />
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[2px] opacity-30 mix-blend-multiply">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-black/20" />
                ))}
              </div>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between group/number">
              <p className="font-mono text-2xl md:text-3xl text-white tracking-[0.18em] drop-shadow-lg font-medium">
                {cardNumberDisplay}
              </p>

              <div className="flex items-center gap-3 opacity-0 group-hover/number:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
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
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Details & Logo */}
          <div className="flex items-end justify-between">
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
                  Card Holder
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") {
                        setEditName(card.name);
                        setIsEditing(false);
                      }
                    }}
                    className="bg-transparent border-b border-white/20 text-sm text-white focus:outline-none focus:border-white/50 font-semibold uppercase tracking-widest w-32"
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-sm font-semibold uppercase tracking-widest truncate max-w-[160px]">
                    {card.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
                  Expires
                </span>
                <p className="text-white text-sm font-mono tracking-widest font-semibold">
                  {card.expiry_date}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="h-6 w-auto brightness-0 invert opacity-90"
              />
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-white/80 text-[11px] font-bold tracking-tight">
                  $
                  {card.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Frozen Overlay */}
        {card.status === "frozen" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-6 py-3 rounded-2xl bg-zinc-900/90 border border-white/10 text-white flex items-center gap-3 shadow-2xl"
            >
              <Snowflake className="w-5 h-5 text-blue-400" />
              <span className="text-base font-bold tracking-wide uppercase">
                Frozen
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
