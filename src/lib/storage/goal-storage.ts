import { DEFAULT_GOALS } from "@/lib/defaults";
import type { FinancialGoal } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-goals";

export function loadFinancialGoals(): FinancialGoal[] {
  if (typeof window === "undefined") return DEFAULT_GOALS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GOALS;
    const parsed = JSON.parse(raw) as FinancialGoal[];
    return Array.isArray(parsed) ? parsed : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveFinancialGoals(goals: FinancialGoal[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function resetFinancialGoals(): FinancialGoal[] {
  saveFinancialGoals(DEFAULT_GOALS);
  return DEFAULT_GOALS;
}

export function clearFinancialGoals(): FinancialGoal[] {
  saveFinancialGoals([]);
  return [];
}

export function createGoalId(): string {
  return crypto.randomUUID();
}
