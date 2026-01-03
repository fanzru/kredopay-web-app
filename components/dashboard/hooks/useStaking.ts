import { useState, useEffect } from "react";

export interface StakingPosition {
  id: string;
  user_email: string;
  amount: number;
  tier: string;
  apr: number;
  staked_at: number;
  unlock_at: number | null;
  lock_period_days: number;
  status: string;
  total_rewards_earned: number;
  last_reward_claim: number | null;
  created_at: number;
  updated_at: number | null;
}

export interface UserProfile {
  user_email: string;
  wallet_address: string | null;
  kredo_balance: number;
  created_at: number;
  updated_at: number | null;
}

export interface StakingData {
  profile: UserProfile;
  positions: StakingPosition[];
  totalStaked: number;
  totalRewards: number;
  currentTier: string;
}

export function useStaking() {
  const [data, setData] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingData = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("kredo_user_email");

      if (!userEmail) {
        throw new Error("No user email found");
      }

      const response = await fetch("/api/staking", {
        headers: {
          "x-user-email": userEmail,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch staking data");
      }

      const stakingData = await response.json();
      setData(stakingData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const stake = async (amount: number, lockPeriodDays: number) => {
    try {
      const userEmail = localStorage.getItem("kredo_user_email");

      if (!userEmail) {
        throw new Error("No user email found");
      }

      const response = await fetch("/api/staking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({ amount, lockPeriodDays }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to stake");
      }

      // Refresh data
      await fetchStakingData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const claimRewards = async (positionId: string) => {
    try {
      const userEmail = localStorage.getItem("kredo_user_email");

      if (!userEmail) {
        throw new Error("No user email found");
      }

      const response = await fetch(`/api/staking/${positionId}/claim`, {
        method: "POST",
        headers: {
          "x-user-email": userEmail,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to claim rewards");
      }

      // Refresh data
      await fetchStakingData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const unstake = async (positionId: string) => {
    try {
      const userEmail = localStorage.getItem("kredo_user_email");

      if (!userEmail) {
        throw new Error("No user email found");
      }

      const response = await fetch(`/api/staking/${positionId}/unstake`, {
        method: "POST",
        headers: {
          "x-user-email": userEmail,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unstake");
      }

      // Refresh data
      await fetchStakingData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchStakingData();
  }, []);

  return {
    data,
    loading,
    error,
    stake,
    claimRewards,
    unstake,
    refresh: fetchStakingData,
  };
}
