import type {
  ActiveDebt,
  DebtProjection,
  ProjectionEvent,
  RegisteredPayment,
} from "./types";
import {
  addMonths,
  addMonthsToDate,
  clampDayToMonth,
  roundMoney,
  toISODate,
  todayParts,
} from "./utils";

export function getActiveDebts(debts: ActiveDebt[]): ActiveDebt[] {
  return debts.filter((debt) => debt.active);
}

export function getTotalActiveDebt(debts: ActiveDebt[]): number {
  return roundMoney(
    getActiveDebts(debts).reduce((sum, debt) => sum + debt.remainingBalance, 0)
  );
}

export function getTotalMonthlyDebtPayments(debts: ActiveDebt[]): number {
  return roundMoney(
    getActiveDebts(debts).reduce((sum, debt) => sum + debt.monthlyPayment, 0)
  );
}

export function createDebtBalanceMap(debts: ActiveDebt[]): Map<string, number> {
  return new Map(
    getActiveDebts(debts).map((debt) => [debt.id, roundMoney(debt.remainingBalance)])
  );
}

export function sumDebtBalances(balances: Map<string, number>): number {
  return roundMoney(
    [...balances.values()].reduce((sum, balance) => sum + balance, 0)
  );
}

/**
 * Gera pagamentos de dívidas do mês e atualiza saldos simulados.
 */
export function applyDebtPaymentsForMonth(
  year: number,
  month: number,
  debts: ActiveDebt[],
  balances: Map<string, number>
): { events: ProjectionEvent[]; totalPaid: number } {
  const events: ProjectionEvent[] = [];
  let totalPaid = 0;

  for (const debt of getActiveDebts(debts)) {
    const currentBalance = balances.get(debt.id) ?? 0;
    if (currentBalance <= 0) continue;

    const payment = roundMoney(Math.min(debt.monthlyPayment, currentBalance));
    balances.set(debt.id, roundMoney(currentBalance - payment));
    totalPaid = roundMoney(totalPaid + payment);

    const day = clampDayToMonth(year, month, debt.dayOfMonth);
    events.push({
      date: toISODate(year, month, day),
      name: `${debt.name} (parcela)`,
      type: "expense",
      amount: payment,
      isDebtPayment: true,
    });
  }

  return {
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
    totalPaid,
  };
}

/**
 * Estima em quantos meses a dívida será quitada com a parcela atual.
 */
export function projectDebtPayoff(
  debt: ActiveDebt,
  remainingOverride?: number
): DebtProjection {
  const remaining = roundMoney(
    Math.max(remainingOverride ?? debt.remainingBalance, 0)
  );
  const monthlyPayment = roundMoney(debt.monthlyPayment);

  if (remaining <= 0) {
    const { year, month, day } = todayParts();
    return {
      debt,
      remaining: 0,
      monthlyPayment,
      estimatedMonths: 0,
      estimatedPayoffDate: addMonthsToDate(year, month, day, 0),
    };
  }

  if (monthlyPayment <= 0) {
    return {
      debt,
      remaining,
      monthlyPayment,
      estimatedMonths: null,
      estimatedPayoffDate: null,
    };
  }

  const estimatedMonths = Math.ceil(remaining / monthlyPayment);
  const { year, month, day } = todayParts();
  const safeDay = clampDayToMonth(year, month, debt.dayOfMonth);

  return {
    debt,
    remaining,
    monthlyPayment,
    estimatedMonths,
    estimatedPayoffDate: addMonthsToDate(
      year,
      month,
      safeDay,
      estimatedMonths - 1
    ),
  };
}

export function projectDebts(
  debts: ActiveDebt[],
  payments: RegisteredPayment[] = []
): DebtProjection[] {
  return getActiveDebts(debts).map((debt) => {
    const paid = roundMoney(
      payments
        .filter(
          (payment) =>
            payment.active &&
            payment.targetType === "debt" &&
            payment.targetId === debt.id
        )
        .reduce((sum, payment) => sum + payment.amount, 0)
    );
    const effectiveRemaining = roundMoney(
      Math.max(0, debt.remainingBalance - paid)
    );
    return projectDebtPayoff(debt, effectiveRemaining);
  });
}

/**
 * Simula saldo devedor mês a mês (útil para gráficos futuros).
 */
export function simulateDebtBalancesOverMonths(
  debts: ActiveDebt[],
  startYear: number,
  startMonth: number,
  monthsAhead: number
): number[] {
  const balances = createDebtBalanceMap(debts);
  const totals: number[] = [];

  for (let i = 0; i < monthsAhead; i++) {
    const { year, month } = addMonths(startYear, startMonth, i);
    applyDebtPaymentsForMonth(year, month, debts, balances);
    totals.push(sumDebtBalances(balances));
  }

  return totals;
}
