"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecurringFormData } from "@/lib/finance/recurring";
import type { RecurringEntry } from "@/lib/finance/types";
import {
  createRecurringId,
  clearRecurringEntries,
  loadRecurringEntries,
  resetRecurringEntries,
  saveRecurringEntries,
} from "@/lib/storage/recurring-storage";

export function useRecurringEntries() {
  const [entries, setEntries] = useState<RecurringEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(loadRecurringEntries());
    setReady(true);
  }, []);

  const persist = useCallback((next: RecurringEntry[]) => {
    setEntries(next);
    saveRecurringEntries(next);
  }, []);

  const createEntry = useCallback(
    (data: RecurringFormData) => {
      const entry: RecurringEntry = {
        id: createRecurringId(),
        name: data.name.trim(),
        type: data.type,
        dayOfMonth: data.dayOfMonth,
        defaultAmount: data.defaultAmount,
        active: data.active,
      };
      persist([...entries, entry]);
      return entry;
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    (id: string, data: RecurringFormData) => {
      persist(
        entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                name: data.name.trim(),
                type: data.type,
                dayOfMonth: data.dayOfMonth,
                defaultAmount: data.defaultAmount,
                active: data.active,
              }
            : entry
        )
      );
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entries.filter((entry) => entry.id !== id));
    },
    [entries, persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist(
        entries.map((entry) =>
          entry.id === id ? { ...entry, active: !entry.active } : entry
        )
      );
    },
    [entries, persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetRecurringEntries());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearRecurringEntries());
  }, [persist]);

  return {
    entries,
    ready,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
