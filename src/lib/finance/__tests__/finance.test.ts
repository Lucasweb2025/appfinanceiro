import { describe, expect, it } from "vitest";
import { projectDebtPayoff, projectDebts } from "../debts";
import { projectGoal, projectGoals } from "../goals";
import { projectMonths } from "../projection";
import type {
  ActiveDebt,
  FinancialGoal,
  ProjectionInput,
  RecurringEntry,
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

const baseInput: ProjectionInput = {
  recurringEntries: lucasEntries,
  variableBudgets: [
    {
      id: "v1",
      name: "Gastos do dia a dia",
      monthlyEstimate: 600,
      active: true,
    },
  ],
  activeDebts: [],
  startingBalance: 500,
  monthsAhead: 6,
  startYear: 2026,
  startMonth: 6,
};

const sampleDebt: ActiveDebt = {
  id: "debt-1",
  name: "Cartão",
  remainingBalance: 2400,
  monthlyPayment: 400,
  dayOfMonth: 15,
  active: true,
};

describe("projectMonths", () => {
  it("calcula entradas fixas do mês de Lucas", () => {
    const result = projectMonths(baseInput);
    const june = result.months[0];

    expect(june.totalIncome).toBe(3748);
    expect(june.totalFixedExpenses).toBe(800);
    expect(june.totalVariableExpenses).toBe(600);
    expect(june.netBalance).toBe(2348);
    expect(june.cumulativeBalance).toBe(2848);
  });

  it("ajusta dia 31 em meses com menos dias", () => {
    const february = projectMonths({
      ...baseInput,
      recurringEntries: [
        {
          id: "x",
          name: "Teste",
          type: "income",
          dayOfMonth: 31,
          defaultAmount: 100,
          active: true,
        },
      ],
      variableBudgets: [],
      monthsAhead: 1,
      startYear: 2026,
      startMonth: 2,
    }).months[0];

    expect(february.events[0]?.date).toBe("2026-02-28");
  });

  it("desconta parcelas de dívidas ativas na sobra mensal", () => {
    const result = projectMonths({
      ...baseInput,
      activeDebts: [sampleDebt],
    });
    const june = result.months[0];

    expect(june.totalDebtPayments).toBe(400);
    expect(june.netBalance).toBe(1948);
    expect(result.totalActiveDebt).toBe(2400);
  });

  it("reduz saldo devedor mês a mês até quitar", () => {
    const result = projectMonths({
      ...baseInput,
      activeDebts: [sampleDebt],
      monthsAhead: 7,
    });

    expect(result.months[4]?.totalDebtRemaining).toBe(400);
    expect(result.months[5]?.totalDebtRemaining).toBe(0);
    expect(result.months[5]?.totalDebtPayments).toBe(400);
    expect(result.months[6]?.totalDebtPayments).toBe(0);
  });
});

describe("projectDebts", () => {
  it("calcula meses para quitar dívida", () => {
    const result = projectDebtPayoff(sampleDebt);

    expect(result.remaining).toBe(2400);
    expect(result.estimatedMonths).toBe(6);
    expect(result.estimatedPayoffDate).not.toBeNull();
  });

  it("ignora dívidas inativas", () => {
    expect(
      projectDebts([{ ...sampleDebt, active: false }])
    ).toHaveLength(0);
  });
});

describe("projectGoal", () => {
  it("estima meses para atingir meta com sobra positiva", () => {
    const goal: FinancialGoal = {
      id: "g1",
      name: "Notebook",
      targetAmount: 4500,
      currentSaved: 800,
      active: true,
    };

    const result = projectGoal(goal, baseInput);

    expect(result.remaining).toBe(3700);
    expect(result.monthlySurplus).toBe(2348);
    expect(result.estimatedMonths).toBe(2);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("retorna null quando sobra mensal é zero ou negativa", () => {
    const goal: FinancialGoal = {
      id: "g2",
      name: "Reserva",
      targetAmount: 10000,
      currentSaved: 0,
      active: true,
    };

    const result = projectGoal(goal, {
      ...baseInput,
      recurringEntries: lucasEntries.filter((e) => e.type === "expense"),
      variableBudgets: [
        { id: "v", name: "Gastos", monthlyEstimate: 5000, active: true },
      ],
    });

    expect(result.estimatedMonths).toBeNull();
    expect(result.estimatedDate).toBeNull();
  });
});

describe("projectGoals", () => {
  it("projeta apenas metas ativas", () => {
    const goals: FinancialGoal[] = [
      {
        id: "a",
        name: "Ativa",
        targetAmount: 1000,
        currentSaved: 0,
        active: true,
      },
      {
        id: "b",
        name: "Inativa",
        targetAmount: 9999,
        currentSaved: 0,
        active: false,
      },
    ];

    expect(projectGoals(goals, baseInput)).toHaveLength(1);
  });
});
