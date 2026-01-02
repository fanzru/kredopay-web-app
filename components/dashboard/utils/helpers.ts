import { Card, Transaction } from "../types";

/**
 * Format a number as USD currency
 */
export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions
): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    ...options,
  });
};

/**
 * Format a date string to localized date
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Calculate total balance from cards
 */
export const calculateTotalBalance = (cards: Card[]): number => {
  return cards.reduce((acc, card) => acc + card.balance, 0);
};

/**
 * Generate a random 4-digit card number
 */
export const generateCardLast4 = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Create a new card object
 */
export const createNewCard = (name: string): Card => {
  return {
    id: `c_${Date.now()}`,
    name,
    last4: generateCardLast4(),
    balance: 1000,
    type: "Virtual",
    color: "from-zinc-800 to-zinc-900",
  };
};
