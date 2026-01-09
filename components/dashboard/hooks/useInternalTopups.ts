import { useState, useEffect } from "react";

export interface InternalTopupRequest {
  id: string;
  userEmail: string;
  requestedAmount: string;
  exactAmount: string;
  decimalCode: string;
  currency: string;
  userWalletAddress: string;
  solanaWalletAddress: string;
  topupMethod: "wallet_address" | "moonpay";
  status: "pending" | "verifying" | "approved" | "rejected" | "completed";
  cardId: string | null;
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
  completedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
  transactionHash?: string | null;
}

export function useInternalTopups() {
  const [topups, setTopups] = useState<InternalTopupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopups = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem("kredo_user_email");
      const token = localStorage.getItem("kredo_auth_token");

      if (!userEmail || !token) {
        setTopups([]);
        return;
      }

      const response = await fetch("/api/internal-topup", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": userEmail,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopups(data.topups || []);
      } else {
        setTopups([]);
      }
    } catch (error) {
      console.error("Error fetching internal topups:", error);
      setTopups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  return {
    topups,
    isLoading,
    refreshTopups: fetchTopups,
  };
}
