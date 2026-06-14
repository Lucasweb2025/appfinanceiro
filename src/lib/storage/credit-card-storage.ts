import { DEFAULT_CREDIT_CARDS } from "@/lib/defaults";
import type { CreditCard } from "@/lib/finance/types";

const STORAGE_KEY = "app-financas-credit-cards";

export function loadCreditCards(): CreditCard[] {
  if (typeof window === "undefined") return DEFAULT_CREDIT_CARDS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CREDIT_CARDS;
    const parsed = JSON.parse(raw) as CreditCard[];
    return Array.isArray(parsed) ? parsed : DEFAULT_CREDIT_CARDS;
  } catch {
    return DEFAULT_CREDIT_CARDS;
  }
}

export function saveCreditCards(cards: CreditCard[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function resetCreditCards(): CreditCard[] {
  saveCreditCards(DEFAULT_CREDIT_CARDS);
  return DEFAULT_CREDIT_CARDS;
}

export function clearCreditCards(): CreditCard[] {
  saveCreditCards([]);
  return [];
}

export function createCreditCardId(): string {
  return crypto.randomUUID();
}
