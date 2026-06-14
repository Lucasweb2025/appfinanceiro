import type {
  AccountBalanceSnapshot,
  AdHocExpense,
  AdHocIncome,
  RegisteredPayment,
} from "./types";
import { filterAdHocExpensesInRange } from "./ad-hoc-expense";
import { filterAdHocIncomesInRange } from "./ad-hoc-income";
import { sumRecurringIncomesAfterSnapshot } from "./recurring";
import { getActiveRegisteredPayments } from "./registered-payment";
import type { RecurringEntry } from "./types";
import { roundMoney } from "./utils";

export interface AccountBalanceFormData {
  amount: number;
  asOfDate: string;
}

export interface AccountBalanceValidationError {
  field: keyof AccountBalanceFormData;
  message: string;
}

export interface BalanceMovementsSinceSnapshot {
  recurringIncomes: number;
  extraIncomes: number;
  registeredPayments: number;
  loggedExpenses: number;
  netChange: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateAccountBalance(
  data: AccountBalanceFormData
): AccountBalanceValidationError[] {
  const errors: AccountBalanceValidationError[] = [];

  if (!Number.isFinite(data.amount)) {
    errors.push({
      field: "amount",
      message: "Informe o saldo da conta.",
    });
  }

  if (!ISO_DATE.test(data.asOfDate)) {
    errors.push({
      field: "asOfDate",
      message: "Informe a data em que conferiu o saldo.",
    });
  }

  return errors;
}

/** Lançamentos depois da data da conferência ajustam o saldo informado */
export function sumMovementsSinceSnapshot(
  snapshot: AccountBalanceSnapshot,
  today: string,
  recurringEntries: RecurringEntry[],
  adHocIncomes: AdHocIncome[],
  adHocExpenses: AdHocExpense[],
  registeredPayments: RegisteredPayment[]
): BalanceMovementsSinceSnapshot {
  const startDate = snapshot.asOfDate;

  if (startDate.localeCompare(today) > 0) {
    return {
      recurringIncomes: 0,
      extraIncomes: 0,
      registeredPayments: 0,
      loggedExpenses: 0,
      netChange: 0,
    };
  }

  const recurringIncomes = sumRecurringIncomesAfterSnapshot(
    recurringEntries,
    startDate,
    today
  );

  const extraIncomes = roundMoney(
    filterAdHocIncomesInRange(adHocIncomes, startDate, today)
      .filter((income) => income.date > startDate)
      .reduce((sum, income) => sum + income.amount, 0)
  );

  const loggedExpenses = roundMoney(
    filterAdHocExpensesInRange(adHocExpenses, startDate, today)
      .filter((expense) => expense.date > startDate)
      .reduce((sum, expense) => sum + expense.amount, 0)
  );

  const registeredPaymentsTotal = roundMoney(
    getActiveRegisteredPayments(registeredPayments)
      .filter(
        (payment) =>
          payment.paidDate > startDate && payment.paidDate <= today
      )
      .reduce((sum, payment) => sum + payment.amount, 0)
  );

  const netChange = roundMoney(
    recurringIncomes +
      extraIncomes -
      loggedExpenses -
      registeredPaymentsTotal
  );

  return {
    recurringIncomes,
    extraIncomes,
    registeredPayments: registeredPaymentsTotal,
    loggedExpenses,
    netChange,
  };
}

export function computeCurrentAccountBalance(
  snapshot: AccountBalanceSnapshot,
  today: string,
  recurringEntries: RecurringEntry[],
  adHocIncomes: AdHocIncome[],
  adHocExpenses: AdHocExpense[],
  registeredPayments: RegisteredPayment[]
): number {
  const movements = sumMovementsSinceSnapshot(
    snapshot,
    today,
    recurringEntries,
    adHocIncomes,
    adHocExpenses,
    registeredPayments
  );

  return roundMoney(snapshot.amount + movements.netChange);
}

export function computeAvailableFromAccountBalance(
  currentBalance: number,
  expensesUpcoming: number,
  variableReserveForPeriod: number,
  untaggedLoggedExpensesUpcoming: number
): number {
  return roundMoney(
    currentBalance -
      expensesUpcoming -
      variableReserveForPeriod -
      untaggedLoggedExpensesUpcoming
  );
}
