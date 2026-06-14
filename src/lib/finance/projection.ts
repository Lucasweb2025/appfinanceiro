import type {
  MonthProjection,
  ProjectionEvent,
  ProjectionInput,
  ProjectionResult,
  RecurringEntry,
} from "./types";
import {
  applyDebtPaymentsForMonth,
  createDebtBalanceMap,
  getTotalActiveDebt,
  getTotalMonthlyDebtPayments,
  projectDebts,
  sumDebtBalances,
} from "./debts";
import {
  addMonths,
  clampDayToMonth,
  formatMonthLabel,
  roundMoney,
  toISODate,
  todayParts,
} from "./utils";

function activeRecurring(entries: RecurringEntry[]) {
  return entries.filter((entry) => entry.active);
}

function buildRecurringEvents(
  year: number,
  month: number,
  recurringEntries: RecurringEntry[]
): ProjectionEvent[] {
  const events: ProjectionEvent[] = [];

  for (const entry of activeRecurring(recurringEntries)) {
    const day = clampDayToMonth(year, month, entry.dayOfMonth);
    events.push({
      date: toISODate(year, month, day),
      name: entry.name,
      type: entry.type,
      amount: entry.defaultAmount,
    });
  }

  return events;
}

function sumByType(events: ProjectionEvent[], type: "income" | "expense") {
  return roundMoney(
    events
      .filter((event) => event.type === type && !event.isDebtPayment)
      .reduce((sum, event) => sum + event.amount, 0)
  );
}

/**
 * Projeta os próximos meses com base em receitas/despesas fixas,
 * dívidas ativas e estimativa de gastos variáveis mensais.
 */
export function projectMonths(input: ProjectionInput): ProjectionResult {
  const today = todayParts();
  const startYear = input.startYear ?? today.year;
  const startMonth = input.startMonth ?? today.month;

  const activeRecurringEntries = activeRecurring(input.recurringEntries);
  const activeVariableBudgets = input.variableBudgets.filter((b) => b.active);
  const debtBalances = createDebtBalanceMap(input.activeDebts);

  const variableMonthlyTotal = roundMoney(
    activeVariableBudgets.reduce((sum, b) => sum + b.monthlyEstimate, 0)
  );

  const months: MonthProjection[] = [];
  let cumulativeBalance = roundMoney(input.startingBalance);
  let totalIncome = 0;
  let totalExpenses = 0;

  for (let i = 0; i < input.monthsAhead; i++) {
    const { year, month } = addMonths(startYear, startMonth, i);
    const recurringEvents = buildRecurringEvents(
      year,
      month,
      activeRecurringEntries
    );
    const { events: debtEvents, totalPaid: monthDebtPayments } =
      applyDebtPaymentsForMonth(year, month, input.activeDebts, debtBalances);

    const events = [...recurringEvents, ...debtEvents].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const monthIncome = sumByType(events, "income");
    const monthFixedExpenses = sumByType(events, "expense");
    const monthVariableExpenses = variableMonthlyTotal;
    const netBalance = roundMoney(
      monthIncome - monthFixedExpenses - monthDebtPayments - monthVariableExpenses
    );

    cumulativeBalance = roundMoney(cumulativeBalance + netBalance);
    totalIncome = roundMoney(totalIncome + monthIncome);
    totalExpenses = roundMoney(
      totalExpenses +
        monthFixedExpenses +
        monthDebtPayments +
        monthVariableExpenses
    );

    months.push({
      year,
      month,
      label: formatMonthLabel(year, month),
      totalIncome: monthIncome,
      totalFixedExpenses: monthFixedExpenses,
      totalDebtPayments: monthDebtPayments,
      totalVariableExpenses: monthVariableExpenses,
      netBalance,
      cumulativeBalance,
      totalDebtRemaining: sumDebtBalances(debtBalances),
      events,
    });
  }

  const averageMonthlySurplus =
    months.length > 0
      ? roundMoney(
          months.reduce((sum, m) => sum + m.netBalance, 0) / months.length
        )
      : 0;

  return {
    months,
    averageMonthlySurplus,
    totalIncome,
    totalExpenses,
    totalActiveDebt: getTotalActiveDebt(input.activeDebts),
    totalMonthlyDebtPayments: getTotalMonthlyDebtPayments(input.activeDebts),
    debtProjections: projectDebts(input.activeDebts),
  };
}

/** Sobra mensal média usada para calcular metas */
export function getMonthlySurplus(input: ProjectionInput): number {
  return projectMonths(input).averageMonthlySurplus;
}
