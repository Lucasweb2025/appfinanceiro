import { DEFAULT_AD_HOC_INCOMES } from "@/lib/defaults";
import type { AdHocIncome } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-ad-hoc-incomes";

export function loadAdHocIncomes(): AdHocIncome[] {
  if (typeof window === "undefined") {
    return DEFAULT_AD_HOC_INCOMES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AD_HOC_INCOMES;

    const parsed = JSON.parse(raw) as AdHocIncome[];
    return Array.isArray(parsed) ? parsed : DEFAULT_AD_HOC_INCOMES;
  } catch {
    return DEFAULT_AD_HOC_INCOMES;
  }
}

export function saveAdHocIncomes(incomes: AdHocIncome[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incomes));
}

export function resetAdHocIncomes(): AdHocIncome[] {
  saveAdHocIncomes(DEFAULT_AD_HOC_INCOMES);
  return DEFAULT_AD_HOC_INCOMES;
}

export function clearAdHocIncomes(): AdHocIncome[] {
  saveAdHocIncomes([]);
  return [];
}

export function createAdHocIncomeId(): string {
  return crypto.randomUUID();
}
