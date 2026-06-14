"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreditCardFormData } from "@/lib/finance/credit-card";
import type { CreditCard } from "@/lib/finance/types";
import {
  clearCreditCards,
  createCreditCardId,
  loadCreditCards,
  resetCreditCards,
  saveCreditCards,
} from "@/lib/storage/credit-card-storage";

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCards(loadCreditCards());
    setReady(true);
  }, []);

  const persist = useCallback((next: CreditCard[]) => {
    setCards(next);
    saveCreditCards(next);
  }, []);

  const createCard = useCallback(
    (data: CreditCardFormData) => {
      const card: CreditCard = {
        id: createCreditCardId(),
        name: data.name.trim(),
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        estimatedBillAmount: data.estimatedBillAmount,
        creditLimit: data.creditLimit,
        active: data.active,
      };
      persist([...cards, card]);
      return card;
    },
    [cards, persist]
  );

  const updateCard = useCallback(
    (id: string, data: CreditCardFormData) => {
      persist(
        cards.map((card) =>
          card.id === id
            ? {
                ...card,
                name: data.name.trim(),
                closingDay: data.closingDay,
                dueDay: data.dueDay,
                estimatedBillAmount: data.estimatedBillAmount,
                creditLimit: data.creditLimit,
                active: data.active,
              }
            : card
        )
      );
    },
    [cards, persist]
  );

  const deleteCard = useCallback(
    (id: string) => {
      persist(cards.filter((card) => card.id !== id));
    },
    [cards, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        cards.map((card) =>
          card.id === id ? { ...card, active: !card.active } : card
        )
      );
    },
    [cards, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetCreditCards());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearCreditCards());
  }, [persist]);

  return {
    cards,
    ready,
    createCard,
    updateCard,
    deleteCard,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
