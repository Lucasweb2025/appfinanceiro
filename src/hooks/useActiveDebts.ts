"use client";

import { useCallback, useEffect, useState } from "react";
import type { DebtFormData } from "@/lib/finance/debt-form";
import type { ActiveDebt } from "@/lib/finance/types";
import {
  clearActiveDebts,
  createDebtId,
  loadActiveDebts,
  resetActiveDebts,
  saveActiveDebts,
} from "@/lib/storage/debt-storage";

export function useActiveDebts() {
  const [debts, setDebts] = useState<ActiveDebt[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDebts(loadActiveDebts());
    setReady(true);
  }, []);

  const persist = useCallback((next: ActiveDebt[]) => {
    setDebts(next);
    saveActiveDebts(next);
  }, []);

  const createDebt = useCallback(
    (data: DebtFormData) => {
      const debt: ActiveDebt = {
        id: createDebtId(),
        name: data.name.trim(),
        remainingBalance: data.remainingBalance,
        monthlyPayment: data.monthlyPayment,
        dayOfMonth: data.dayOfMonth,
        active: data.active,
      };
      persist([...debts, debt]);
      return debt;
    },
    [debts, persist]
  );

  const updateDebt = useCallback(
    (id: string, data: DebtFormData) => {
      persist(
        debts.map((debt) =>
          debt.id === id
            ? {
                ...debt,
                name: data.name.trim(),
                remainingBalance: data.remainingBalance,
                monthlyPayment: data.monthlyPayment,
                dayOfMonth: data.dayOfMonth,
                active: data.active,
              }
            : debt
        )
      );
    },
    [debts, persist]
  );

  const deleteDebt = useCallback(
    (id: string) => {
      persist(debts.filter((debt) => debt.id !== id));
    },
    [debts, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        debts.map((debt) =>
          debt.id === id ? { ...debt, active: !debt.active } : debt
        )
      );
    },
    [debts, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetActiveDebts());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearActiveDebts());
  }, [persist]);

  return {
    debts,
    ready,
    createDebt,
    updateDebt,
    deleteDebt,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
