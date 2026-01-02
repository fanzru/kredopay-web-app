"use client";

import React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

// Wrapper to match existing API
export function useToast() {
  const showToast = (type: ToastType, message: string) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
        toast.info(message);
        break;
      default:
        toast(message);
    }
  };

  return { showToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "rgba(24, 24, 27, 0.8)", // zinc-900/80
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(63, 63, 70, 0.5)", // zinc-700/50
            color: "white",
          },
        }}
      />
    </>
  );
}
