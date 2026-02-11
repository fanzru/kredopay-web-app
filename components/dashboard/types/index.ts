// Dashboard Types
export interface Card {
  id: string;
  name: string;
  last4: string;
  balance: number;
  type: "Virtual" | "Permission";
  color: string;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "topup" | "spend";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

export type ActionType = "send" | "receive" | "create_card" | null;

export type TabName =
  | "overview"
  | "identity"
  | "intents"
  | "permissions"
  | "fog"
  | "terminal"
  | "history"
  | "settings"
  | "topups"
  | "community"
  | "agents"
  | "staking";
