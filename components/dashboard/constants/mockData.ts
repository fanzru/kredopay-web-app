import { Card, Transaction } from "../types";

// Initial mock data for cards
export const INITIAL_CARDS: Card[] = [
  {
    id: "c_1",
    name: "AWS Infrastructure",
    last4: "9012",
    balance: 1250.0,
    type: "Virtual",
    color: "from-zinc-800 to-zinc-900",
  },
  {
    id: "c_2",
    name: "Travel Allowance",
    last4: "3321",
    balance: 5000.0,
    type: "Permission",
    color: "from-zinc-800 to-zinc-900",
  },
];

// Initial mock data for transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t_1",
    type: "receive",
    amount: 2500,
    description: "Monthly Limit Reset",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "completed",
  },
  {
    id: "t_2",
    type: "spend",
    amount: 64.2,
    description: "Cloudflare Subscription",
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "completed",
  },
  {
    id: "t_3",
    type: "spend",
    amount: 12.5,
    description: "Vercel Hosting",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: "completed",
  },
];

// Storage keys
export const STORAGE_KEYS = {
  CARDS: "kredo_db_cards",
  TRANSACTIONS: "kredo_db_tx",
  AUTH_TOKEN: "kredo_auth_token",
} as const;
