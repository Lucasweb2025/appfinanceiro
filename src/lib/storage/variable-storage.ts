import { DEFAULT_VARIABLE } from "@/lib/defaults";
import type { VariableBudget } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-variable-budgets";

export function loadVariableBudgets(): VariableBudget[] {
  if (typeof window === "undefined") {
    return DEFAULT_VARIABLE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VARIABLE;

    const parsed = JSON.parse(raw) as VariableBudget[];
    return Array.isArray(parsed) ? parsed : DEFAULT_VARIABLE;
  } catch {
    return DEFAULT_VARIABLE;
  }
}

export function saveVariableBudgets(budgets: VariableBudget[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

export function resetVariableBudgets(): VariableBudget[] {
  saveVariableBudgets(DEFAULT_VARIABLE);
  return DEFAULT_VARIABLE;
}

export function clearVariableBudgets(): VariableBudget[] {
  saveVariableBudgets([]);
  return [];
}

export function createVariableId(): string {
  return crypto.randomUUID();
}
