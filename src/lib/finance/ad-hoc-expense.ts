import type { AdHocExpense } from "./types";
import { roundMoney } from "./utils";

export interface AdHocExpenseFormData {
  name: string;
  amount: number;
  date: string;
  variableBudgetId?: string;
  active: boolean;
}

export interface AdHocExpenseValidationError {
  field: keyof AdHocExpenseFormData;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function getActiveAdHocExpenses(expenses: AdHocExpense[]): AdHocExpense[] {
  return expenses.filter((expense) => expense.active);
}

export function validateAdHocExpense(
  data: AdHocExpenseFormData
): AdHocExpenseValidationError[] {
  const errors: AdHocExpenseValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    errors.push({
      field: "amount",
      message: "Valor deve ser maior que zero.",
    });
  }

  if (!ISO_DATE.test(data.date)) {
    errors.push({
      field: "date",
      message: "Informe uma data válida.",
    });
  }

  return errors;
}

export function sumAdHocExpensesInRange(
  expenses: AdHocExpense[],
  startDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) =>
          expense.date.localeCompare(startDate) >= 0 &&
          expense.date.localeCompare(endDate) <= 0
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

export function filterAdHocExpensesInRange(
  expenses: AdHocExpense[],
  startDate: string,
  endDate: string
): AdHocExpense[] {
  return getActiveAdHocExpenses(expenses)
    .filter(
      (expense) =>
        expense.date.localeCompare(startDate) >= 0 &&
        expense.date.localeCompare(endDate) <= 0
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export function sumAdHocExpensesInMonth(
  expenses: AdHocExpense[],
  year: number,
  month: number
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter((expense) => expense.date.startsWith(prefix))
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

export function sumAdHocExpensesForBudgetInMonth(
  expenses: AdHocExpense[],
  variableBudgetId: string,
  year: number,
  month: number
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return roundMoney(
    getActiveAdHocExpenses(expenses)
      .filter(
        (expense) =>
          expense.variableBudgetId === variableBudgetId &&
          expense.date.startsWith(prefix)
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
}

export function sortAdHocExpensesNewestFirst(
  expenses: AdHocExpense[]
): AdHocExpense[] {
  return [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );
}
