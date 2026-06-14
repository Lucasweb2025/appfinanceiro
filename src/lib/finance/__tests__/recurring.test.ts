import { describe, expect, it } from "vitest";
import { summarizeRecurringMonth, validateRecurringEntry } from "../recurring";
import type { RecurringEntry } from "../types";

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

describe("summarizeRecurringMonth", () => {
  it("calcula totais do exemplo Lucas", () => {
    const summary = summarizeRecurringMonth(lucasEntries, 2026, 6);

    expect(summary.totalIncome).toBe(3748);
    expect(summary.totalFixedExpenses).toBe(800);
    expect(summary.netBalance).toBe(2948);
    expect(summary.events).toHaveLength(4);
  });

  it("ignora lançamentos inativos", () => {
    const summary = summarizeRecurringMonth(
      lucasEntries.map((entry) =>
        entry.id === "4" ? { ...entry, active: false } : entry
      ),
      2026,
      6
    );

    expect(summary.totalFixedExpenses).toBe(0);
    expect(summary.netBalance).toBe(3748);
  });
});

describe("validateRecurringEntry", () => {
  it("rejeita valor zero e nome curto", () => {
    const errors = validateRecurringEntry({
      name: "A",
      type: "income",
      dayOfMonth: 0,
      defaultAmount: 0,
      active: true,
    });

    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
