import { DEFAULT_AD_HOC_EXPENSES } from "@/lib/defaults";
import type { AdHocExpense } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-ad-hoc-expenses";

export function loadAdHocExpenses(): AdHocExpense[] {
  if (typeof window === "undefined") {
    return DEFAULT_AD_HOC_EXPENSES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AD_HOC_EXPENSES;

    const parsed = JSON.parse(raw) as AdHocExpense[];
    return Array.isArray(parsed) ? parsed : DEFAULT_AD_HOC_EXPENSES;
  } catch {
    return DEFAULT_AD_HOC_EXPENSES;
  }
}

export function saveAdHocExpenses(expenses: AdHocExpense[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function resetAdHocExpenses(): AdHocExpense[] {
  saveAdHocExpenses(DEFAULT_AD_HOC_EXPENSES);
  return DEFAULT_AD_HOC_EXPENSES;
}

export function clearAdHocExpenses(): AdHocExpense[] {
  saveAdHocExpenses([]);
  return [];
}

export function createAdHocExpenseId(): string {
  return crypto.randomUUID();
}
