import type {
  AccountBalanceSnapshot,
  ActiveDebt,
  CreditCard,
  RecurringEntry,
  VariableBudget,
} from "@/lib/finance/types";

const INCOME_NAMES = ["Salário", "Vale", "Freela", "Condução"];
const EXPENSE_NAMES = ["Aluguel", "Faculdade", "Academia", "Internet", "Cursos"];
const VARIABLE_NAMES = ["Comida", "Transporte", "Lazer", "Dia a dia"];
const CARD_NAMES = ["Nubank", "Inter", "C6"];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function money(rng: () => number, min: number, max: number): number {
  return Math.round((min + rng() * (max - min)) / 5) * 5;
}

export interface SyntheticProfile {
  id: number;
  recurring: RecurringEntry[];
  variable: VariableBudget[];
  debts: ActiveDebt[];
  creditCards: CreditCard[];
  accountBalance: AccountBalanceSnapshot;
}

export function buildSyntheticProfile(id: number): SyntheticProfile {
  const rng = mulberry32(id * 9973 + 42);
  const recurring: RecurringEntry[] = [];

  const incomeCount = 2 + Math.floor(rng() * 2);
  const usedIncomeDays = new Set<number>();
  for (let i = 0; i < incomeCount; i++) {
    let day = 1 + Math.floor(rng() * 28);
    while (usedIncomeDays.has(day)) day = (day % 28) + 1;
    usedIncomeDays.add(day);
    recurring.push({
      id: `income-${id}-${i}`,
      name: pick(rng, INCOME_NAMES),
      type: "income",
      dayOfMonth: day,
      defaultAmount: money(rng, 800, 4000),
      active: true,
    });
  }

  const expenseCount = 3 + Math.floor(rng() * 3);
  const usedExpenseDays = new Set<number>();
  for (let i = 0; i < expenseCount; i++) {
    let day = 1 + Math.floor(rng() * 28);
    while (usedExpenseDays.has(day)) day = (day % 28) + 1;
    usedExpenseDays.add(day);
    recurring.push({
      id: `expense-${id}-${i}`,
      name: pick(rng, EXPENSE_NAMES),
      type: "expense",
      dayOfMonth: day,
      defaultAmount: money(rng, 40, 900),
      active: true,
    });
  }

  const variableCount = 1 + Math.floor(rng() * 2);
  const variable: VariableBudget[] = Array.from({ length: variableCount }, (_, i) => ({
    id: `variable-${id}-${i}`,
    name: pick(rng, VARIABLE_NAMES),
    monthlyEstimate: money(rng, 150, 800),
    active: true,
  }));

  const debts: ActiveDebt[] =
    rng() > 0.6
      ? [
          {
            id: `debt-${id}`,
            name: "Empréstimo",
            remainingBalance: money(rng, 500, 5000),
            monthlyPayment: money(rng, 100, 500),
            dayOfMonth: 5 + Math.floor(rng() * 20),
            active: true,
          },
        ]
      : [];

  const creditCards: CreditCard[] =
    rng() > 0.4
      ? [
          {
            id: `card-${id}`,
            name: pick(rng, CARD_NAMES),
            closingDay: 1 + Math.floor(rng() * 28),
            dueDay: 1 + Math.floor(rng() * 28),
            estimatedBillAmount: money(rng, 100, 1200),
            creditLimit: money(rng, 500, 3000),
            active: true,
          },
        ]
      : [];

  const day = 1 + Math.floor(rng() * 28);
  const accountBalance: AccountBalanceSnapshot = {
    amount: money(rng, 0, 3500),
    asOfDate: `2026-06-${String(day).padStart(2, "0")}`,
  };

  return {
    id,
    recurring,
    variable,
    debts,
    creditCards,
    accountBalance,
  };
}

export function buildSyntheticProfiles(count: number): SyntheticProfile[] {
  return Array.from({ length: count }, (_, index) => buildSyntheticProfile(index + 1));
}
