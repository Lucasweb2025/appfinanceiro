import type { ActiveDebt } from "./types";
import { roundMoney } from "./utils";

export interface DebtFormData {
  name: string;
  remainingBalance: number;
  monthlyPayment: number;
  dayOfMonth: number;
  active: boolean;
}

export interface DebtValidationError {
  field: keyof DebtFormData;
  message: string;
}

export function validateActiveDebt(data: DebtFormData): DebtValidationError[] {
  const errors: DebtValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (!Number.isInteger(data.dayOfMonth) || data.dayOfMonth < 1 || data.dayOfMonth > 31) {
    errors.push({
      field: "dayOfMonth",
      message: "Dia de vencimento deve ser entre 1 e 31.",
    });
  }

  if (!Number.isFinite(data.remainingBalance) || data.remainingBalance < 0) {
    errors.push({
      field: "remainingBalance",
      message: "Saldo devedor não pode ser negativo.",
    });
  }

  if (!Number.isFinite(data.monthlyPayment) || data.monthlyPayment <= 0) {
    errors.push({
      field: "monthlyPayment",
      message: "Parcela deve ser maior que zero.",
    });
  }

  if (
    data.remainingBalance > 0 &&
    data.monthlyPayment > data.remainingBalance
  ) {
    errors.push({
      field: "monthlyPayment",
      message: "Parcela não pode ser maior que o saldo devedor.",
    });
  }

  return errors;
}

export function sumDebtPaymentsForMonth(debts: ActiveDebt[]): number {
  return roundMoney(
    debts
      .filter((d) => d.active && d.remainingBalance > 0)
      .reduce(
        (sum, debt) =>
          sum + roundMoney(Math.min(debt.monthlyPayment, debt.remainingBalance)),
        0
      )
  );
}
