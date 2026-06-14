import { describe, expect, it } from "vitest";
import { buildCashPeriodSummary } from "../cash-period";
import type { RecurringEntry, VariableBudget } from "../types";

const lucasEntries: RecurringEntry[] = [
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
];

const variableBudgets: VariableBudget[] = [
  { id: "v1", name: "Dia a dia", monthlyEstimate: 600, active: true },
];

describe("cash period with account balance", () => {
  it("usa saldo em conta como base do disponível", () => {
    const period = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      [],
      [],
      [],
      [],
      [],
      { amount: 2000, asOfDate: "2026-06-13" },
      2026,
      6,
      13
    );

    expect(period.usesAccountBalance).toBe(true);
    expect(period.currentAccountBalance).toBe(2000);
    expect(period.availableToSpend).toBe(2000);
    expect(period.variableBudgetForPeriod).toBeGreaterThan(0);
  });
});
