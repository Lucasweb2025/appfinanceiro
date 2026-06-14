import type { AdHocIncome } from "./types";
import { roundMoney } from "./utils";

export interface AdHocIncomeFormData {
  name: string;
  amount: number;
  date: string;
  active: boolean;
}

export interface AdHocIncomeValidationError {
  field: keyof AdHocIncomeFormData;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function getActiveAdHocIncomes(incomes: AdHocIncome[]): AdHocIncome[] {
  return incomes.filter((income) => income.active);
}

export function validateAdHocIncome(
  data: AdHocIncomeFormData
): AdHocIncomeValidationError[] {
  const errors: AdHocIncomeValidationError[] = [];
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

export function sumAdHocIncomesInRange(
  incomes: AdHocIncome[],
  startDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveAdHocIncomes(incomes)
      .filter(
        (income) =>
          income.date.localeCompare(startDate) >= 0 &&
          income.date.localeCompare(endDate) <= 0
      )
      .reduce((sum, income) => sum + income.amount, 0)
  );
}

export function filterAdHocIncomesInRange(
  incomes: AdHocIncome[],
  startDate: string,
  endDate: string
): AdHocIncome[] {
  return getActiveAdHocIncomes(incomes)
    .filter(
      (income) =>
        income.date.localeCompare(startDate) >= 0 &&
        income.date.localeCompare(endDate) <= 0
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export function sortAdHocIncomesNewestFirst(incomes: AdHocIncome[]): AdHocIncome[] {
  return [...incomes].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );
}
