import type { FinancialGoal } from "./types";
import { roundMoney } from "./utils";

export interface GoalFormData {
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate?: string;
  active: boolean;
}

export interface GoalValidationError {
  field: keyof GoalFormData;
  message: string;
}

export function validateFinancialGoal(data: GoalFormData): GoalValidationError[] {
  const errors: GoalValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (!Number.isFinite(data.targetAmount) || data.targetAmount <= 0) {
    errors.push({
      field: "targetAmount",
      message: "Valor da meta deve ser maior que zero.",
    });
  }

  if (!Number.isFinite(data.currentSaved) || data.currentSaved < 0) {
    errors.push({
      field: "currentSaved",
      message: "Valor guardado não pode ser negativo.",
    });
  }

  if (
    Number.isFinite(data.targetAmount) &&
    Number.isFinite(data.currentSaved) &&
    data.currentSaved > data.targetAmount
  ) {
    errors.push({
      field: "currentSaved",
      message: "Valor guardado não pode ser maior que a meta.",
    });
  }

  if (data.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.targetDate)) {
    errors.push({
      field: "targetDate",
      message: "Data desejada inválida.",
    });
  }

  return errors;
}

export function getGoalProgressPercent(
  targetAmount: number,
  currentSaved: number
): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, roundMoney((currentSaved / targetAmount) * 100));
}
