import { DEFAULT_RECURRING } from "@/lib/defaults";
import type { RecurringEntry } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-recurring-entries";

export function loadRecurringEntries(): RecurringEntry[] {
  if (typeof window === "undefined") {
    return DEFAULT_RECURRING;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_RECURRING;
    }

    const parsed = JSON.parse(raw) as RecurringEntry[];
    return Array.isArray(parsed) ? parsed : DEFAULT_RECURRING;
  } catch {
    return DEFAULT_RECURRING;
  }
}

export function saveRecurringEntries(entries: RecurringEntry[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function resetRecurringEntries(): RecurringEntry[] {
  saveRecurringEntries(DEFAULT_RECURRING);
  return DEFAULT_RECURRING;
}

export function clearRecurringEntries(): RecurringEntry[] {
  saveRecurringEntries([]);
  return [];
}

export function createRecurringId(): string {
  return crypto.randomUUID();
}
