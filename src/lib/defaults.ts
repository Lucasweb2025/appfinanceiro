import type { ProjectionInput } from "@/lib/finance/types";
import {
  LUCAS_ACCOUNT_BALANCE,
  LUCAS_AD_HOC_EXPENSES,
  LUCAS_AD_HOC_INCOMES,
  LUCAS_CREDIT_CARDS,
  LUCAS_DEBTS,
  LUCAS_GOALS,
  LUCAS_RECURRING,
  LUCAS_REGISTERED_PAYMENTS,
  LUCAS_VARIABLE,
} from "@/lib/fixtures/lucas-profile";

export {
  LUCAS_ACCOUNT_BALANCE as DEFAULT_ACCOUNT_BALANCE,
  LUCAS_PROFILE,
} from "@/lib/fixtures/lucas-profile";

export const DEFAULT_RECURRING = LUCAS_RECURRING;
export const DEFAULT_DEBTS = LUCAS_DEBTS;
export const DEFAULT_CREDIT_CARDS = LUCAS_CREDIT_CARDS;
export const DEFAULT_VARIABLE = LUCAS_VARIABLE;
export const DEFAULT_AD_HOC_EXPENSES = LUCAS_AD_HOC_EXPENSES;
export const DEFAULT_AD_HOC_INCOMES = LUCAS_AD_HOC_INCOMES;
export const DEFAULT_REGISTERED_PAYMENTS = LUCAS_REGISTERED_PAYMENTS;
export const DEFAULT_GOALS = LUCAS_GOALS;

export function buildProjectionInput(
  recurringEntries: typeof DEFAULT_RECURRING,
  variableBudgets: typeof DEFAULT_VARIABLE,
  activeDebts: typeof DEFAULT_DEBTS,
  startingBalance: number,
  monthsAhead: number
): ProjectionInput {
  return {
    recurringEntries,
    variableBudgets,
    activeDebts,
    startingBalance,
    monthsAhead,
  };
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
