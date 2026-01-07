"use client";

import { useState, useEffect } from "react";

export interface RolePolicy {
  id: string;
  name: string;
  accessLevel: "full" | "limited" | "restricted";
  dailyLimit?: number;
  description: string;
}

export interface GlobalConstraint {
  id: string;
  name: string;
  value: string | number | boolean;
  enabled: boolean;
  description: string;
}

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("kredo_auth_token");
  return !!token;
};

export function usePermissionsAuth() {
  const [rolePolicies, setRolePolicies] = useState<RolePolicy[]>([]);
  const [globalConstraints, setGlobalConstraints] = useState<
    GlobalConstraint[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("kredo_auth_token");
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (!checkAuth()) {
      setRolePolicies([]);
      setGlobalConstraints([]);
      setIsLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call to Kredo backend
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Simulated role policies
        const mockRoles: RolePolicy[] = [
          {
            id: "role-admin",
            name: "Admin Role",
            accessLevel: "full",
            description: "Full access to all spending intents and permissions",
          },
          {
            id: "role-ai-agents",
            name: "AI Agents",
            accessLevel: "limited",
            dailyLimit: 50,
            description: "Automated agents with daily spending limits",
          },
          {
            id: "role-team",
            name: "Team Members",
            accessLevel: "limited",
            dailyLimit: 200,
            description: "Standard team access with moderate limits",
          },
        ];

        // Simulated global constraints
        const mockConstraints: GlobalConstraint[] = [
          {
            id: "constraint-max-tx",
            name: "Max Transaction Size",
            value: 1000,
            enabled: true,
            description: "Maximum amount per single transaction",
          },
          {
            id: "constraint-approved-merchants",
            name: "Approved Merchants Only",
            value: true,
            enabled: true,
            description: "Only allow transactions with pre-approved merchants",
          },
          {
            id: "constraint-time-window",
            name: "Time Window Restriction",
            value: "9AM-6PM UTC",
            enabled: false,
            description: "Restrict spending to specific time windows",
          },
          {
            id: "constraint-geo-fence",
            name: "Geographic Restriction",
            value: "Singapore, US, EU",
            enabled: false,
            description: "Limit transactions to specific regions",
          },
        ];

        setRolePolicies(mockRoles);
        setGlobalConstraints(mockConstraints);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch permissions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kredo_auth_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const createRolePolicy = async (
    name: string,
    accessLevel: RolePolicy["accessLevel"],
    dailyLimit?: number
  ) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual role policy creation
      console.log("Creating role policy:", { name, accessLevel, dailyLimit });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newRole: RolePolicy = {
        id: `role-${Date.now()}`,
        name,
        accessLevel,
        dailyLimit,
        description: `Custom role: ${name}`,
      };

      setRolePolicies((prev) => [...prev, newRole]);
      return newRole;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create role policy"
      );
    }
  };

  const updateRolePolicy = async (
    roleId: string,
    updates: Partial<RolePolicy>
  ) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual role policy update
      console.log("Updating role policy:", roleId, updates);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRolePolicies((prev) =>
        prev.map((role) =>
          role.id === roleId ? { ...role, ...updates } : role
        )
      );
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update role policy"
      );
    }
  };

  const deleteRolePolicy = async (roleId: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual role policy deletion
      console.log("Deleting role policy:", roleId);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRolePolicies((prev) => prev.filter((role) => role.id !== roleId));
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete role policy"
      );
    }
  };

  const toggleConstraint = async (constraintId: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual constraint toggle
      console.log("Toggling constraint:", constraintId);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setGlobalConstraints((prev) =>
        prev.map((constraint) =>
          constraint.id === constraintId
            ? { ...constraint, enabled: !constraint.enabled }
            : constraint
        )
      );
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to toggle constraint"
      );
    }
  };

  const createGlobalConstraint = async (
    name: string,
    value: string | number | boolean,
    description: string,
    enabled: boolean = true
  ) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual global constraint creation
      console.log("Creating global constraint:", {
        name,
        value,
        description,
        enabled,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newConstraint: GlobalConstraint = {
        id: `constraint-${Date.now()}`,
        name,
        value,
        enabled,
        description,
      };

      setGlobalConstraints((prev) => [...prev, newConstraint]);
      return newConstraint;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create global constraint"
      );
    }
  };

  const updateConstraintValue = async (
    constraintId: string,
    value: string | number | boolean
  ) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      // TODO: Implement actual constraint value update
      console.log("Updating constraint value:", constraintId, value);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGlobalConstraints((prev) =>
        prev.map((constraint) =>
          constraint.id === constraintId ? { ...constraint, value } : constraint
        )
      );
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update constraint"
      );
    }
  };

  return {
    rolePolicies,
    globalConstraints,
    isLoading,
    error,
    isAuthenticated,
    createRolePolicy,
    updateRolePolicy,
    deleteRolePolicy,
    createGlobalConstraint,
    toggleConstraint,
    updateConstraintValue,
  };
}
