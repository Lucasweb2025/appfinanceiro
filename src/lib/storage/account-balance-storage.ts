import { DEFAULT_ACCOUNT_BALANCE } from "@/lib/defaults";
import type { AccountBalanceSnapshot } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-account-balance";

export function loadAccountBalance(): AccountBalanceSnapshot | null {
  if (typeof window === "undefined") {
    return DEFAULT_ACCOUNT_BALANCE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNT_BALANCE;

    const parsed = JSON.parse(raw) as AccountBalanceSnapshot;
    if (
      !parsed ||
      typeof parsed.amount !== "number" ||
      typeof parsed.asOfDate !== "string"
    ) {
      return DEFAULT_ACCOUNT_BALANCE;
    }

    return parsed;
  } catch {
    return DEFAULT_ACCOUNT_BALANCE;
  }
}

export function saveAccountBalance(snapshot: AccountBalanceSnapshot | null): void {
  if (snapshot === null) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function resetAccountBalance(): AccountBalanceSnapshot {
  saveAccountBalance(DEFAULT_ACCOUNT_BALANCE);
  return DEFAULT_ACCOUNT_BALANCE;
}

export function clearAccountBalance(): null {
  saveAccountBalance(null);
  return null;
}
