"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdHocIncomeFormData } from "@/lib/finance/ad-hoc-income";
import type { AdHocIncome } from "@/lib/finance/types";
import {
  clearAdHocIncomes,
  createAdHocIncomeId,
  loadAdHocIncomes,
  resetAdHocIncomes,
  saveAdHocIncomes,
} from "@/lib/storage/ad-hoc-income-storage";

export function useAdHocIncomes() {
  const [incomes, setIncomes] = useState<AdHocIncome[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIncomes(loadAdHocIncomes());
    setReady(true);
  }, []);

  const persist = useCallback((next: AdHocIncome[]) => {
    setIncomes(next);
    saveAdHocIncomes(next);
  }, []);

  const createIncome = useCallback(
    (data: AdHocIncomeFormData) => {
      const income: AdHocIncome = {
        id: createAdHocIncomeId(),
        name: data.name.trim(),
        amount: data.amount,
        date: data.date,
        active: data.active,
      };
      persist([...incomes, income]);
      return income;
    },
    [incomes, persist]
  );

  const updateIncome = useCallback(
    (id: string, data: AdHocIncomeFormData) => {
      persist(
        incomes.map((income) =>
          income.id === id
            ? {
                ...income,
                name: data.name.trim(),
                amount: data.amount,
                date: data.date,
                active: data.active,
              }
            : income
        )
      );
    },
    [incomes, persist]
  );

  const deleteIncome = useCallback(
    (id: string) => {
      persist(incomes.filter((income) => income.id !== id));
    },
    [incomes, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        incomes.map((income) =>
          income.id === id ? { ...income, active: !income.active } : income
        )
      );
    },
    [incomes, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetAdHocIncomes());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearAdHocIncomes());
  }, [persist]);

  return {
    incomes,
    ready,
    createIncome,
    updateIncome,
    deleteIncome,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
