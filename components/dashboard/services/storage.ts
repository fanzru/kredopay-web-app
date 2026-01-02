import { Card, Transaction } from "../types";
import { STORAGE_KEYS } from "../constants/mockData";

/**
 * Storage service for managing local storage operations
 */
export class StorageService {
  /**
   * Get cards from local storage
   */
  static getCards(): Card[] | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CARDS);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Save cards to local storage
   */
  static saveCards(cards: Card[]): void {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }

  /**
   * Get transactions from local storage
   */
  static getTransactions(): Transaction[] | null {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Save transactions to local storage
   */
  static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
  }

  /**
   * Get auth token from local storage
   */
  static getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Remove auth token from local storage
   */
  static removeAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}
