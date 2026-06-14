import { describe, expect, it } from "vitest";
import { buildAssistantSummary } from "../assistant";
import { buildDashboardSummary } from "../dashboard";
import type { DashboardSummary } from "../dashboard";

function minimalDashboard(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
    year: 2026,
    month: 6,
    label: "jun/2026",
    totalIncome: 3748,
    totalFixedExpenses: 800,
    totalVariableExpenses: 800,
    totalDebtPayments: 300,
    totalCreditCardBills: 1200,
    totalExpenses: 3100,
    netBalance: 648,
    monthlySurplus: 648,
    totalActiveDebt: 1800,
    totalMonthlyDebtPayments: 300,
    variableItems: [],
    debtItems: [],
    creditCardItems: [],
    goalProjections: [],
    upcomingAlerts: [
      {
        date: "2026-06-10",
        day: 10,
        label: "Aluguel",
        amount: 800,
        kind: "expense",
        paymentPresetKey: "recurring:rent",
      },
    ],
    paidAlerts: [],
    timelineEvents: [],
    cashPeriod: {
      referenceDate: "2026-06-13",
      referenceDayLabel: "13 jun",
      lastIncome: {
        date: "2026-06-05",
        name: "Recebimento",
        amount: 1750,
        dayOfMonth: 5,
      },
      nextIncome: {
        date: "2026-06-20",
        name: "Recebimento dia 20",
        amount: 1750,
        dayOfMonth: 20,
      },
      periodStartDate: "2026-06-13",
      periodEndDate: "2026-06-20",
      periodDays: 8,
      daysRemaining: 8,
      incomeReceived: 1750,
      extraIncomePast: 0,
      extraIncomeUpcoming: 0,
      extraIncomeTotal: 0,
      expensesAlreadyPaid: 0,
      expensesUpcoming: 0,
      loggedExpensesPast: 0,
      loggedExpensesUpcoming: 0,
      loggedExpensesTotal: 0,
      registeredPaymentsPast: 0,
      registeredPaymentsUpcoming: 0,
      cycleEvents: [],
      variableBudgetForPeriod: 213,
      totalVariableMonthly: 800,
      availableToSpend: 600,
      availableAfterNextIncome: 2350,
      dailyBudget: 75,
      periodEvents: [],
      hasIncomes: true,
      usesAccountBalance: true,
      accountBalanceSnapshot: { amount: 2000, asOfDate: "2026-06-13" },
      currentAccountBalance: 2000,
      balanceMovementsSinceSnapshot: {
        recurringIncomes: 0,
        extraIncomes: 0,
        registeredPayments: 0,
        loggedExpenses: 0,
        netChange: 0,
      },
      incomeDayProjection: null,
    },
    calendar: {
      year: 2026,
      month: 6,
      label: "jun/2026",
      weekDayHeaders: ["D", "S", "T", "Q", "Q", "S", "S"],
      days: [],
    },
    ...overrides,
  };
}

describe("buildAssistantSummary", () => {
  it("avisa conta vencida a partir do dashboard real", () => {
    const dashboard = buildDashboardSummary(
      [
        {
          id: "rent",
          name: "Aluguel",
          type: "expense",
          dayOfMonth: 10,
          defaultAmount: 800,
          active: true,
        },
        {
          id: "inc",
          name: "Salário",
          type: "income",
          dayOfMonth: 5,
          defaultAmount: 3000,
          active: true,
        },
      ],
      [],
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

    const summary = buildAssistantSummary(
      dashboard,
      { tone: "direct", bankReminderDismissed: true },
      { label: "jul/2026", netBalance: 648 }
    );

    expect(summary.messages.some((m) => m.text.includes("venceu"))).toBe(true);
  });

  it("usa tom direto para conta vencida", () => {
    const summary = buildAssistantSummary(
      minimalDashboard(),
      { tone: "direct", bankReminderDismissed: true },
      { label: "jul/2026", netBalance: 648 }
    );

    expect(summary.messages.some((m) => m.text.includes("venceu"))).toBe(true);
  });

  it("avisa quando próximo mês não fecha", () => {
    const summary = buildAssistantSummary(
      minimalDashboard(),
      { tone: "gentle", bankReminderDismissed: true },
      { label: "jul/2026", netBalance: -200 }
    );

    expect(summary.messages.some((m) => m.text.includes("jul/2026"))).toBe(true);
  });
});
