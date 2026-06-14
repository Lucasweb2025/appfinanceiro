import { describe, expect, it } from "vitest";
import {
  buildCashPeriodSummary,
  findLastIncomeBefore,
  findNextIncomeAfter,
} from "../cash-period";
import type {
  ActiveDebt,
  CreditCard,
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

describe("cash period", () => {
  it("encontra próximo recebimento após dia 13", () => {
    const next = findNextIncomeAfter(lucasEntries, 2026, 6, 13);
    expect(next?.date).toBe("2026-06-20");
    expect(next?.amount).toBe(1750);
  });

  it("encontra último recebimento antes do dia 13", () => {
    const last = findLastIncomeBefore(lucasEntries, 2026, 6, 13);
    expect(last?.date).toBe("2026-06-05");
    expect(last?.amount).toBe(1750);
  });

  it("calcula disponível até a próxima entrada no dia 13/06", () => {
    const period = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      [],
      null,
      2026,
      6,
      13
    );

    expect(period.nextIncome?.date).toBe("2026-06-20");
    expect(period.periodDays).toBe(8);
    expect(period.incomeReceived).toBe(1750);
    expect(period.expensesAlreadyPaid).toBe(0);
    expect(period.expensesUpcoming).toBe(0);
    expect(period.variableBudgetForPeriod).toBeCloseTo(213.33, 1);
    expect(period.availableToSpend).toBeCloseTo(1536.67, 1);
    expect(period.availableAfterNextIncome).toBeCloseTo(3286.67, 1);
  });

  it("desconta gastos lançados no período (ex.: café R$ 21 amanhã)", () => {
    const period = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [
        {
          id: "e1",
          name: "Café da manhã",
          amount: 21,
          date: "2026-06-14",
          variableBudgetId: "v1",
          active: true,
        },
      ],
      [],
      [],
      null,
      2026,
      6,
      13
    );

    expect(period.loggedExpensesUpcoming).toBe(21);
    expect(period.loggedExpensesTotal).toBe(21);
    expect(period.availableToSpend).toBeCloseTo(1515.67, 1);
    expect(period.periodEvents.some((e) => e.kind === "logged")).toBe(true);
  });

  it("retorna vazio quando não há recebimentos", () => {
    const onlyExpense: RecurringEntry[] = [
      {
        id: "e1",
        name: "Aluguel",
        type: "expense",
        dayOfMonth: 10,
        defaultAmount: 800,
        active: true,
      },
    ];

    const period = buildCashPeriodSummary(
      onlyExpense,
      [],
      [],
      [],
      [],
      [],
      [],
      null,
      2026,
      6,
      13
    );

    expect(period.hasIncomes).toBe(false);
    expect(period.nextIncome).toBeNull();
  });
});
