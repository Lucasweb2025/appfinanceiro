import type { AdHocExpense, VariableBudget } from "./types";
import {
  countDaysInclusive,
  daysInMonth,
  roundMoney,
} from "./utils";
import {
  getActiveAdHocExpenses,
  sumAdHocExpensesForBudgetInMonth,
} from "./ad-hoc-expense";

export interface VariableFormData {
  name: string;
  monthlyEstimate: number;
  active: boolean;
}

export interface VariableValidationError {
  field: keyof VariableFormData;
  message: string;
}

export function validateVariableBudget(
  data: VariableFormData
): VariableValidationError[] {
  const errors: VariableValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (!Number.isFinite(data.monthlyEstimate) || data.monthlyEstimate <= 0) {
    errors.push({
      field: "monthlyEstimate",
      message: "Valor estimado deve ser maior que zero.",
    });
  }

  return errors;
}

export function sumVariableExpenses(budgets: VariableBudget[]): number {
  return roundMoney(
    budgets
      .filter((budget) => budget.active)
      .reduce((sum, budget) => sum + budget.monthlyEstimate, 0)
  );
}

export function getActiveVariableBudgets(
  budgets: VariableBudget[]
): VariableBudget[] {
  return budgets.filter((budget) => budget.active);
}

function sumVariableBudgetSpentInRange(
  expenses: AdHocExpense[],
  budgetId: string,
  startDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) =>
          expense.variableBudgetId === budgetId &&
          expense.date.localeCompare(startDate) >= 0 &&
          expense.date.localeCompare(endDate) <= 0
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

/** Reserva variável: orçamento proporcional menos o que já saiu na categoria */
export function sumVariableReserveForRange(
  budgets: VariableBudget[],
  expenses: AdHocExpense[],
  startDate: string,
  endDate: string,
  year: number,
  month: number
): number {
  const monthDays = daysInMonth(year, month);
  const rangeDays = countDaysInclusive(startDate, endDate);

  return roundMoney(
    getActiveVariableBudgets(budgets).reduce((sum, budget) => {
      const prorated = roundMoney(
        budget.monthlyEstimate * (rangeDays / monthDays)
      );
      const spent = sumVariableBudgetSpentInRange(
        expenses,
        budget.id,
        startDate,
        endDate
      );
      return sum + Math.max(0, prorated - spent);
    }, 0)
  );
}

/** Custo variável efetivo: max(orçamento, gasto) por categoria */
export function sumVariableExpensesWithLoggedInRange(
  budgets: VariableBudget[],
  expenses: AdHocExpense[],
  startDate: string,
  endDate: string,
  year: number,
  month: number
): number {
  const monthDays = daysInMonth(year, month);
  const rangeDays = countDaysInclusive(startDate, endDate);

  return roundMoney(
    getActiveVariableBudgets(budgets).reduce((sum, budget) => {
      const prorated = roundMoney(
        budget.monthlyEstimate * (rangeDays / monthDays)
      );
      const spent = sumVariableBudgetSpentInRange(
        expenses,
        budget.id,
        startDate,
        endDate
      );
      return sum + Math.max(prorated, spent);
    }, 0)
  );
}

export function sumVariableExpensesWithLoggedInMonth(
  budgets: VariableBudget[],
  expenses: AdHocExpense[],
  year: number,
  month: number
): number {
  return roundMoney(
    getActiveVariableBudgets(budgets).reduce((sum, budget) => {
      const spent = sumAdHocExpensesForBudgetInMonth(
        expenses,
        budget.id,
        year,
        month
      );
      return sum + Math.max(budget.monthlyEstimate, spent);
    }, 0)
  );
}

export function sumVariableCostForRemainingPeriod(
  budgets: VariableBudget[],
  expenses: AdHocExpense[],
  spentStartDate: string,
  periodStartDate: string,
  periodEndDate: string,
  year: number,
  month: number
): number {
  const monthDays = daysInMonth(year, month);
  const remainingDays = countDaysInclusive(periodStartDate, periodEndDate);

  return roundMoney(
    getActiveVariableBudgets(budgets).reduce((sum, budget) => {
      const prorated = roundMoney(
        budget.monthlyEstimate * (remainingDays / monthDays)
      );
      const spent = sumVariableBudgetSpentInRange(
        expenses,
        budget.id,
        spentStartDate,
        periodEndDate
      );
      return sum + Math.max(prorated, spent);
    }, 0)
  );
}

export function sumUntaggedAdHocExpensesInRange(
  expenses: AdHocExpense[],
  startDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) =>
          !expense.variableBudgetId &&
          expense.date.localeCompare(startDate) >= 0 &&
          expense.date.localeCompare(endDate) <= 0
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

export function sumUntaggedAdHocExpensesInMonth(
  expenses: AdHocExpense[],
  year: number,
  month: number
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) => !expense.variableBudgetId && expense.date.startsWith(prefix)
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

export function sumUntaggedAdHocExpensesUpcomingInRange(
  expenses: AdHocExpense[],
  afterDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) =>
          !expense.variableBudgetId &&
          expense.date.localeCompare(afterDate) > 0 &&
          expense.date.localeCompare(endDate) <= 0
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}
