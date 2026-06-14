import { describe, expect, it } from "vitest";
import { summarizeMonth } from "../month-summary";
import type { RecurringEntry, VariableBudget } from "../types";

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
  {
    id: "v1",
    name: "Gastos do dia a dia",
    monthlyEstimate: 600,
    active: true,
  },
  {
    id: "v2",
    name: "Lazer",
    monthlyEstimate: 200,
    active: true,
  },
];

describe("summarizeMonth", () => {
  it("inclui despesas variáveis na sobra", () => {
    const summary = summarizeMonth(lucasEntries, variableBudgets, 2026, 6);

    expect(summary.totalIncome).toBe(3748);
    expect(summary.totalFixedExpenses).toBe(800);
    expect(summary.totalVariableExpenses).toBe(800);
    expect(summary.netBalance).toBe(2148);
    expect(summary.variableItems).toHaveLength(2);
  });

  it("ignora variáveis inativas", () => {
    const summary = summarizeMonth(
      lucasEntries,
      variableBudgets.map((b) =>
        b.id === "v2" ? { ...b, active: false } : b
      ),
      2026,
      6
    );

    expect(summary.totalVariableExpenses).toBe(600);
    expect(summary.netBalance).toBe(2348);
  });
});
