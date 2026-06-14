import { describe, expect, it } from "vitest";
import { buildIncomeDayProjection } from "../cash-period";
import type { ActiveDebt, CreditCard, RecurringEntry } from "../types";

const recurringEntries: RecurringEntry[] = [
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

const creditCards: CreditCard[] = [];

describe("buildIncomeDayProjection", () => {
  it("projeta quanto sobra no dia do recebimento após pagar contas fixas", () => {
    const fullCycleEvents = [
      {
        id: "debt-8",
        date: "2026-06-08",
        day: 8,
        name: "Empréstimo (parcela)",
        amount: 300,
        type: "expense" as const,
        kind: "debt" as const,
      },
      {
        id: "rent-10",
        date: "2026-06-10",
        day: 10,
        name: "Aluguel",
        amount: 800,
        type: "expense" as const,
        kind: "recurring" as const,
      },
    ];

    const projection = buildIncomeDayProjection(
      fullCycleEvents,
      recurringEntries,
      activeDebts,
      creditCards,
      {
        date: "2026-06-20",
        name: "Recebimento dia 20",
        amount: 1750,
        dayOfMonth: 20,
      },
      true,
      500,
      0,
      0,
      0,
      0,
      0,
      "2026-06-05"
    );

    expect(projection.incomeAmount).toBe(1750);
    expect(projection.unpaidBillsTotal).toBe(1100);
    expect(projection.remainingAfterIncomeAndBills).toBe(1150);
    expect(projection.unpaidBills).toHaveLength(2);
  });
});
