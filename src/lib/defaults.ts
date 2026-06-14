import type {
  ActiveDebt,
  AdHocExpense,
  AdHocIncome,
  CreditCard,
  FinancialGoal,
  ProjectionInput,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "@/lib/finance/types";

export const DEFAULT_RECURRING: RecurringEntry[] = [
  {
    id: "income-30",
    name: "Condução",
    type: "income",
    dayOfMonth: 30,
    defaultAmount: 248,
    active: true,
  },
  {
    id: "income-5",
    name: "Recebimento dia 5",
    type: "income",
    dayOfMonth: 5,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "income-20",
    name: "Recebimento dia 20",
    type: "income",
    dayOfMonth: 20,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "expense-rent",
    name: "Aluguel",
    type: "expense",
    dayOfMonth: 10,
    defaultAmount: 800,
    active: true,
  },
];

export const DEFAULT_DEBTS: ActiveDebt[] = [
  {
    id: "debt-personal",
    name: "Empréstimo pessoal",
    remainingBalance: 1800,
    monthlyPayment: 300,
    dayOfMonth: 8,
    active: true,
  },
];

export const DEFAULT_CREDIT_CARDS: CreditCard[] = [
  {
    id: "card-main",
    name: "Nubank",
    closingDay: 25,
    dueDay: 3,
    estimatedBillAmount: 1200,
    creditLimit: 5000,
    active: true,
  },
];

export const DEFAULT_VARIABLE: VariableBudget[] = [
  {
    id: "variable-daily",
    name: "Gastos do dia a dia",
    monthlyEstimate: 600,
    active: true,
  },
  {
    id: "variable-leisure",
    name: "Lazer",
    monthlyEstimate: 200,
    active: true,
  },
];

export const DEFAULT_AD_HOC_EXPENSES: AdHocExpense[] = [];

export const DEFAULT_AD_HOC_INCOMES: AdHocIncome[] = [];

export const DEFAULT_REGISTERED_PAYMENTS: RegisteredPayment[] = [];

export const DEFAULT_GOALS: FinancialGoal[] = [
  {
    id: "goal-notebook",
    name: "Notebook",
    targetAmount: 4500,
    currentSaved: 800,
    targetDate: "2026-12-01",
    active: true,
  },
];

export function buildProjectionInput(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  activeDebts: ActiveDebt[],
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
