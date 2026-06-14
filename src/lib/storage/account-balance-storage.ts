import type { AccountBalanceSnapshot } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-account-balance";

export function loadAccountBalance(): AccountBalanceSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AccountBalanceSnapshot;
    if (
      !parsed ||
      typeof parsed.amount !== "number" ||
      typeof parsed.asOfDate !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveAccountBalance(snapshot: AccountBalanceSnapshot | null): void {
  if (snapshot === null) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearAccountBalance(): null {
  saveAccountBalance(null);
  return null;
}
