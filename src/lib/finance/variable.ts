import type { VariableBudget } from "./types";
import { roundMoney } from "./utils";

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
