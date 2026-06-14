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

  it("inclui gastos avulsos e ganhos extras na sobra do mês", () => {
    const dashboard = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [
        {
          id: "e1",
          name: "Mercado",
          amount: 150,
          date: "2026-06-12",
          active: true,
        },
      ],
      [
        {
          id: "i1",
          name: "Freela",
          amount: 300,
          date: "2026-06-11",
          active: true,
        },
      ],
      [],
      null,
      2026,
      6
    );

    expect(dashboard.totalIncome).toBe(4048);
    expect(dashboard.totalExpenses).toBe(3250);
    expect(dashboard.netBalance).toBe(798);
    expect(dashboard.monthlySurplus).toBe(798);
  });

  it("mantém contas vencidas nos alertas do mês", () => {
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
      6,
      13
    );

    const overdue = dashboard.upcomingAlerts.find(
      (alert) => alert.label === "Aluguel" && alert.date === "2026-06-10"
    );

    expect(overdue).toBeDefined();
    expect(overdue?.isPaid).toBeFalsy();
  });

  it("não duplica gasto variável categorizado na sobra do mês", () => {
    const dashboard = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [
        {
          id: "e1",
          name: "Mercado",
          amount: 150,
          date: "2026-06-12",
          variableBudgetId: "v1",
          active: true,
        },
      ],
      [],
      [],
      null,
      2026,
      6
    );

    expect(dashboard.totalExpenses).toBe(3100);
    expect(dashboard.netBalance).toBe(648);
  });

  it("melhora sobra quando contas são marcadas como pagas", () => {
    const withoutPayment = buildDashboardSummary(
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
      6,
      13
    );

    const withPayment = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      [],
      [
        {
          id: "p1",
          targetType: "debt",
          targetId: "d2",
          label: "Empréstimo (parcela)",
          amount: 300,
          paidDate: "2026-06-13",
          referenceMonth: "2026-06",
          paidEarly: false,
          active: true,
        },
      ],
      null,
      2026,
      6,
      13
    );

    expect(withPayment.netBalance - withoutPayment.netBalance).toBe(300);
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

  it("reduz saldo devedor exibido após pagamentos registrados", () => {
    const dashboard = buildDashboardSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      [],
      [
        {
          id: "p1",
          targetType: "debt",
          targetId: "d2",
          label: "Empréstimo (parcela)",
          amount: 300,
          paidDate: "2026-06-08",
          referenceMonth: "2026-06",
          paidEarly: false,
          active: true,
        },
      ],
      null,
      2026,
      6,
      13
    );

    expect(dashboard.debtItems[0]?.remaining).toBe(1500);
    expect(dashboard.debtItems[0]?.estimatedMonths).toBe(5);
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
