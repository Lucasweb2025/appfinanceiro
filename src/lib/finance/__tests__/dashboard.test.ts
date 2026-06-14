import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "../dashboard";
import { projectGoalWithSurplus } from "../goals";
import type {
  ActiveDebt,
  CreditCard,
  FinancialGoal,
  RecurringEntry,
  VariableBudget,
} from "../types";

const lucasEntries: RecurringEntry[] = [
  {
    id: "1",
    name: "Condução",
    type: "income",
    dayOfMonth: 30,
    defaultAmount: 248,
    active: true,
  },
  {
    id: "2",
    name: "Recebimento dia 5",
    type: "income",
    dayOfMonth: 5,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "3",
    name: "Recebimento dia 20",
    type: "income",
    dayOfMonth: 20,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "4",
    name: "Aluguel",
    type: "expense",
    dayOfMonth: 10,
    defaultAmount: 800,
    active: true,
  },
];

const variableBudgets: VariableBudget[] = [
  { id: "v1", name: "Dia a dia", monthlyEstimate: 600, active: true },
  { id: "v2", name: "Lazer", monthlyEstimate: 200, active: true },
];

const activeDebts: ActiveDebt[] = [
  {
    id: "d2",
    name: "Empréstimo",
    remainingBalance: 1800,
    monthlyPayment: 300,
    dayOfMonth: 8,
    active: true,
  },
];

const creditCards: CreditCard[] = [
  {
    id: "c1",
    name: "Nubank",
    closingDay: 25,
    dueDay: 3,
    estimatedBillAmount: 1200,
    active: true,
  },
];

const goals: FinancialGoal[] = [
  {
    id: "g1",
    name: "Notebook",
    targetAmount: 4500,
    currentSaved: 800,
    active: true,
  },
];

describe("buildDashboardSummary", () => {
  it("calcula sobra com fixos, variáveis, dívidas e cartões", () => {
    const dashboard = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      [],
      [],
      null,
      2026,
      6
    );

    expect(dashboard.totalIncome).toBe(3748);
    expect(dashboard.totalExpenses).toBe(3100);
    expect(dashboard.netBalance).toBe(648);
    expect(dashboard.monthlySurplus).toBe(648);
  });

  it("projeta metas com a sobra mensal", () => {
    const dashboard = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      goals,
      [],
      [],
      [],
      null,
      2026,
      6
    );

    expect(dashboard.goalProjections).toHaveLength(1);
    expect(dashboard.goalProjections[0]?.remaining).toBe(3700);
    expect(dashboard.goalProjections[0]?.estimatedMonths).toBe(6);
  });
});

describe("projectGoalWithSurplus", () => {
  it("retorna null quando sobra é zero", () => {
    const result = projectGoalWithSurplus(
      {
        id: "g",
        name: "Teste",
        targetAmount: 1000,
        currentSaved: 0,
        active: true,
      },
      0
    );

    expect(result.estimatedMonths).toBeNull();
  });
});
