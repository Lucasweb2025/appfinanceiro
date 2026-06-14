"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountBalanceFormData } from "@/lib/finance/account-balance";
import type { AccountBalanceSnapshot } from "@/lib/finance/types";
import {
  clearAccountBalance,
  loadAccountBalance,
  resetAccountBalance,
  saveAccountBalance,
} from "@/lib/storage/account-balance-storage";

export function useAccountBalance() {
  const [snapshot, setSnapshot] = useState<AccountBalanceSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSnapshot(loadAccountBalance());
    setReady(true);
  }, []);

  const persist = useCallback((next: AccountBalanceSnapshot | null) => {
    setSnapshot(next);
    saveAccountBalance(next);
  }, []);

  const saveSnapshot = useCallback(
    (data: AccountBalanceFormData) => {
      const next: AccountBalanceSnapshot = {
        amount: data.amount,
        asOfDate: data.asOfDate,
      };
      persist(next);
      return next;
    },
    [persist]
  );

  const clearSnapshot = useCallback(() => {
    persist(clearAccountBalance());
  }, [persist]);

  const restoreDefaults = useCallback(() => {
    persist(resetAccountBalance());
  }, [persist]);

  return {
    snapshot,
    ready,
    saveSnapshot,
    clearSnapshot,
    restoreDefaults,
  };
}
