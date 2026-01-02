"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ActionType } from "../types";

interface ActionModalProps {
  activeAction: ActionType;
  onClose: () => void;
  newCardName: string;
  onCardNameChange: (name: string) => void;
  onCreateCard: () => void;
}

export function ActionModal({
  activeAction,
  onClose,
  newCardName,
  onCardNameChange,
  onCreateCard,
}: ActionModalProps) {
  if (!activeAction) return null;

  const getTitle = () => {
    switch (activeAction) {
      case "create_card":
        return "New Permission Intent";
      case "send":
        return "Execute Payment";
      case "receive":
        return "Receive Assets";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-[#161616] border border-zinc-800 rounded-3xl p-6 shadow-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">{getTitle()}</h3>

          {activeAction === "create_card" && (
            <div className="space-y-4">
              <input
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                placeholder="Purpose (e.g. Travel)"
                value={newCardName}
                onChange={(e) => onCardNameChange(e.target.value)}
              />
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs leading-relaxed">
                This will create a virtual zero-knowledge permission scope. No
                funds are pre-loaded.
              </div>
              <Button
                onClick={onCreateCard}
                className="w-full bg-white text-black hover:bg-zinc-200"
              >
                Generate Proof
              </Button>
            </div>
          )}

          {activeAction !== "create_card" && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Simulation Mode Active
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
