"use client";

import { useState, useEffect } from "react";
import { Card, Transaction, ActionType } from "../types";
import { INITIAL_CARDS, INITIAL_TRANSACTIONS } from "../constants/mockData";
import { StorageService } from "../services/storage";
import { calculateTotalBalance, createNewCard } from "../utils/helpers";

export function useOverviewData() {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [newCardName, setNewCardName] = useState("");

  // Load initial data from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedCards = StorageService.getCards();
      const storedTx = StorageService.getTransactions();

      if (storedCards) {
        setCards(storedCards);
      } else {
        setCards(INITIAL_CARDS);
        StorageService.saveCards(INITIAL_CARDS);
      }

      if (storedTx) {
        setTransactions(storedTx);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        StorageService.saveTransactions(INITIAL_TRANSACTIONS);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Calculate total balance when cards change
  useEffect(() => {
    const total = calculateTotalBalance(cards);
    setBalance(total);
  }, [cards]);

  // Handle creating a new card
  const handleCreateCard = () => {
    if (!newCardName) return;

    const newCard = createNewCard(newCardName);
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    StorageService.saveCards(updatedCards);
    setNewCardName("");
    setActiveAction(null);
  };

  return {
    cards,
    transactions,
    balance,
    isLoading,
    activeAction,
    setActiveAction,
    newCardName,
    setNewCardName,
    handleCreateCard,
  };
}
