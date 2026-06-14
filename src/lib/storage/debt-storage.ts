import { DEFAULT_DEBTS } from "@/lib/defaults";
import type { ActiveDebt } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-active-debts";

export function loadActiveDebts(): ActiveDebt[] {
  if (typeof window === "undefined") return DEFAULT_DEBTS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEBTS;
    const parsed = JSON.parse(raw) as ActiveDebt[];
    return Array.isArray(parsed) ? parsed : DEFAULT_DEBTS;
  } catch {
    return DEFAULT_DEBTS;
  }
}

export function saveActiveDebts(debts: ActiveDebt[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
}

export function resetActiveDebts(): ActiveDebt[] {
  saveActiveDebts(DEFAULT_DEBTS);
  return DEFAULT_DEBTS;
}

export function clearActiveDebts(): ActiveDebt[] {
  saveActiveDebts([]);
  return [];
}

export function createDebtId(): string {
  return crypto.randomUUID();
}
