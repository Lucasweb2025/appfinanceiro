import type { RecurringEntry, VariableBudget } from "./types";
import { roundMoney } from "./utils";
import { summarizeRecurringMonth, type MonthSummary } from "./recurring";
import { getActiveVariableBudgets, sumVariableExpenses } from "./variable";

export interface FullMonthSummary extends MonthSummary {
  totalVariableExpenses: number;
  variableItems: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
}

/** Resumo do mês: fixos + despesas não fixas (estimativa) */
export function summarizeMonth(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  year: number,
  month: number
): FullMonthSummary {
  const base = summarizeRecurringMonth(recurringEntries, year, month);
  const totalVariableExpenses = sumVariableExpenses(variableBudgets);
  const variableItems = getActiveVariableBudgets(variableBudgets).map((budget) => ({
    id: budget.id,
    name: budget.name,
    amount: budget.monthlyEstimate,
  }));

  return {
    ...base,
    totalVariableExpenses,
    variableItems,
    netBalance: roundMoney(
      base.totalIncome - base.totalFixedExpenses - totalVariableExpenses
    ),
  };
}
