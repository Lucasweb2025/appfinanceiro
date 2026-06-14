import { DEFAULT_REGISTERED_PAYMENTS } from "@/lib/defaults";
import type { RegisteredPayment } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-registered-payments";

export function loadRegisteredPayments(): RegisteredPayment[] {
  if (typeof window === "undefined") {
    return DEFAULT_REGISTERED_PAYMENTS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REGISTERED_PAYMENTS;

    const parsed = JSON.parse(raw) as RegisteredPayment[];
    return Array.isArray(parsed) ? parsed : DEFAULT_REGISTERED_PAYMENTS;
  } catch {
    return DEFAULT_REGISTERED_PAYMENTS;
  }
}

export function saveRegisteredPayments(payments: RegisteredPayment[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

export function resetRegisteredPayments(): RegisteredPayment[] {
  saveRegisteredPayments(DEFAULT_REGISTERED_PAYMENTS);
  return DEFAULT_REGISTERED_PAYMENTS;
}

export function clearRegisteredPayments(): RegisteredPayment[] {
  saveRegisteredPayments([]);
  return [];
}

export function createRegisteredPaymentId(): string {
  return crypto.randomUUID();
}
