"use client";

import { useCallback, useEffect, useState } from "react";
import type { VariableFormData } from "@/lib/finance/variable";
import type { VariableBudget } from "@/lib/finance/types";
import {
  clearVariableBudgets,
  createVariableId,
  loadVariableBudgets,
  resetVariableBudgets,
  saveVariableBudgets,
} from "@/lib/storage/variable-storage";

export function useVariableBudgets() {
  const [budgets, setBudgets] = useState<VariableBudget[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBudgets(loadVariableBudgets());
    setReady(true);
  }, []);

  const persist = useCallback((next: VariableBudget[]) => {
    setBudgets(next);
    saveVariableBudgets(next);
  }, []);

  const createBudget = useCallback(
    (data: VariableFormData) => {
      const budget: VariableBudget = {
        id: createVariableId(),
        name: data.name.trim(),
        monthlyEstimate: data.monthlyEstimate,
        active: data.active,
      };
      persist([...budgets, budget]);
      return budget;
    },
    [budgets, persist]
  );

  const updateBudget = useCallback(
    (id: string, data: VariableFormData) => {
      persist(
        budgets.map((budget) =>
          budget.id === id
            ? {
                ...budget,
                name: data.name.trim(),
                monthlyEstimate: data.monthlyEstimate,
                active: data.active,
              }
            : budget
        )
      );
    },
    [budgets, persist]
  );

  const deleteBudget = useCallback(
    (id: string) => {
      persist(budgets.filter((budget) => budget.id !== id));
    },
    [budgets, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        budgets.map((budget) =>
          budget.id === id ? { ...budget, active: !budget.active } : budget
        )
      );
    },
    [budgets, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetVariableBudgets());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearVariableBudgets());
  }, [persist]);

  return {
    budgets,
    ready,
    createBudget,
    updateBudget,
    deleteBudget,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
