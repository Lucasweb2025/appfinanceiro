"use client";

import { useCallback, useEffect, useState } from "react";
import type { RegisteredPaymentFormData } from "@/lib/finance/registered-payment";
import type { RegisteredPayment } from "@/lib/finance/types";
import {
  clearRegisteredPayments,
  createRegisteredPaymentId,
  loadRegisteredPayments,
  resetRegisteredPayments,
  saveRegisteredPayments,
} from "@/lib/storage/registered-payment-storage";

export function useRegisteredPayments() {
  const [payments, setPayments] = useState<RegisteredPayment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPayments(loadRegisteredPayments());
    setReady(true);
  }, []);

  const persist = useCallback((next: RegisteredPayment[] | ((current: RegisteredPayment[]) => RegisteredPayment[])) => {
    setPayments((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      saveRegisteredPayments(resolved);
      return resolved;
    });
  }, []);

  const createPayment = useCallback(
    (data: RegisteredPaymentFormData) => {
      const payment: RegisteredPayment = {
        id: createRegisteredPaymentId(),
        targetType: data.targetType,
        targetId: data.targetId,
        label: data.label.trim(),
        amount: data.amount,
        paidDate: data.paidDate,
        referenceMonth: data.referenceMonth,
        paidEarly: data.paidEarly,
        active: data.active,
      };
      persist((current) => [...current, payment]);
      return payment;
    },
    [persist]
  );

  const updatePayment = useCallback(
    (id: string, data: RegisteredPaymentFormData) => {
      persist((current) =>
        current.map((payment) =>
          payment.id === id
            ? {
                ...payment,
                targetType: data.targetType,
                targetId: data.targetId,
                label: data.label.trim(),
                amount: data.amount,
                paidDate: data.paidDate,
                referenceMonth: data.referenceMonth,
                paidEarly: data.paidEarly,
                active: data.active,
              }
            : payment
        )
      );
    },
    [persist]
  );

  const deletePayment = useCallback(
    (id: string) => {
      persist((current) => current.filter((payment) => payment.id !== id));
    },
    [persist]
  );

  const toggleActive = useCallback(
    (id: string) => {
      persist((current) =>
        current.map((payment) =>
          payment.id === id ? { ...payment, active: !payment.active } : payment
        )
      );
    },
    [persist]
  );

  const restoreDefaults = useCallback(() => {
    persist(resetRegisteredPayments());
  }, [persist]);

  const clearAll = useCallback(() => {
    persist(clearRegisteredPayments());
  }, [persist]);

  return {
    payments,
    ready,
    createPayment,
    updatePayment,
    deletePayment,
    toggleActive,
    restoreDefaults,
    clearAll,
  };
}
