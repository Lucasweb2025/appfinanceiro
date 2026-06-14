"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoalFormData } from "@/lib/finance/goal-form";
import type { FinancialGoal } from "@/lib/finance/types";
import {
  clearFinancialGoals,
  createGoalId,
  loadFinancialGoals,
  resetFinancialGoals,
  saveFinancialGoals,
} from "@/lib/storage/goal-storage";

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGoals(loadFinancialGoals());
    setReady(true);
  }, []);

  const persist = useCallback((next: FinancialGoal[]) => {
    setGoals(next);
    saveFinancialGoals(next);
  }, []);

  const createGoal = useCallback(
    (data: GoalFormData) => {
      const goal: FinancialGoal = {
        id: createGoalId(),
        name: data.name.trim(),
        targetAmount: data.targetAmount,
        currentSaved: data.currentSaved,
        targetDate: data.targetDate || undefined,
        active: data.active,
      };
      persist([...goals, goal]);
      return goal;
    },
    [goals, persist]
  );

  const updateGoal = useCallback(
    (id: string, data: GoalFormData) => {
      persist(
        goals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                name: data.name.trim(),
                targetAmount: data.targetAmount,
                currentSaved: data.currentSaved,
                targetDate: data.targetDate || undefined,
                active: data.active,
              }
            : goal
        )
      );
    },
    [goals, persist]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      persist(goals.filter((goal) => goal.id !== id));
    },
    [goals, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        goals.map((goal) =>
          goal.id === id ? { ...goal, active: !goal.active } : goal
        )
      );
    },
    [goals, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetFinancialGoals());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearFinancialGoals());
  }, [persist]);

  return {
    goals,
    ready,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
