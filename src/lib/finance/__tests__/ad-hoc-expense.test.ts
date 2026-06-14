import { describe, expect, it } from "vitest";
import {
  sumAdHocExpensesForBudgetInMonth,
  sumAdHocExpensesInRange,
  validateAdHocExpense,
} from "../ad-hoc-expense";
import type { AdHocExpense } from "../types";

describe("ad-hoc expense", () => {
  const expenses: AdHocExpense[] = [
    {
      id: "1",
      name: "Café",
      amount: 21,
      date: "2026-06-14",
      variableBudgetId: "v1",
      active: true,
    },
    {
      id: "2",
      name: "Inativo",
      amount: 100,
      date: "2026-06-14",
      active: false,
    },
  ];

  it("valida formulário", () => {
    expect(
      validateAdHocExpense({
        name: "C",
        amount: 21,
        date: "2026-06-14",
        active: true,
      })
    ).toHaveLength(1);

    expect(
      validateAdHocExpense({
        name: "Café",
        amount: 21,
        date: "2026-06-14",
        active: true,
      })
    ).toHaveLength(0);
  });

  it("soma gastos em intervalo ignorando inativos", () => {
    expect(sumAdHocExpensesInRange(expenses, "2026-06-13", "2026-06-20")).toBe(
      21
    );
  });

  it("soma por categoria no mês", () => {
    expect(
      sumAdHocExpensesForBudgetInMonth(expenses, "v1", 2026, 6)
    ).toBe(21);
  });
});
