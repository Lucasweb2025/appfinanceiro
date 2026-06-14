"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdHocExpenseFormData } from "@/lib/finance/ad-hoc-expense";
import type { AdHocExpense } from "@/lib/finance/types";
import {
  clearAdHocExpenses,
  createAdHocExpenseId,
  loadAdHocExpenses,
  resetAdHocExpenses,
  saveAdHocExpenses,
} from "@/lib/storage/ad-hoc-expense-storage";

export function useAdHocExpenses() {
  const [expenses, setExpenses] = useState<AdHocExpense[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setExpenses(loadAdHocExpenses());
    setReady(true);
  }, []);

  const persist = useCallback((next: AdHocExpense[]) => {
    setExpenses(next);
    saveAdHocExpenses(next);
  }, []);

  const createExpense = useCallback(
    (data: AdHocExpenseFormData) => {
      const expense: AdHocExpense = {
        id: createAdHocExpenseId(),
        name: data.name.trim(),
        amount: data.amount,
        date: data.date,
        variableBudgetId: data.variableBudgetId || undefined,
        active: data.active,
      };
      persist([...expenses, expense]);
      return expense;
    },
    [expenses, persist]
  );

  const updateExpense = useCallback(
    (id: string, data: AdHocExpenseFormData) => {
      persist(
        expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                name: data.name.trim(),
                amount: data.amount,
                date: data.date,
                variableBudgetId: data.variableBudgetId || undefined,
                active: data.active,
              }
            : expense
        )
      );
    },
    [expenses, persist]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((expense) => expense.id !== id));
    },
    [expenses, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        expenses.map((expense) =>
          expense.id === id ? { ...expense, active: !expense.active } : expense
        )
      );
    },
    [expenses, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetAdHocExpenses());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearAdHocExpenses());
  }, [persist]);

  return {
    expenses,
    ready,
    createExpense,
    updateExpense,
    deleteExpense,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
