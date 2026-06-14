import { describe, expect, it } from "vitest";
import {
  computeAvailableFromAccountBalance,
  computeCurrentAccountBalance,
  sumMovementsSinceSnapshot,
} from "../account-balance";
import type {
  AccountBalanceSnapshot,
  AdHocExpense,
  AdHocIncome,
  RegisteredPayment,
} from "../types";

describe("account balance", () => {
  const snapshot: AccountBalanceSnapshot = {
    amount: 2450,
    asOfDate: "2026-06-10",
  };

  it("ajusta saldo com pagamentos e ganhos depois da conferência", () => {
    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d1",
        label: "Empréstimo",
        amount: 300,
        paidDate: "2026-06-13",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
    ];

    const incomes: AdHocIncome[] = [
      {
        id: "i1",
        name: "Freela",
        amount: 500,
        date: "2026-06-12",
        active: true,
      },
    ];

    const movements = sumMovementsSinceSnapshot(
      snapshot,
      "2026-06-13",
      incomes,
      [],
      payments
    );

    expect(movements.extraIncomes).toBe(500);
    expect(movements.registeredPayments).toBe(300);
    expect(movements.netChange).toBe(200);

    expect(
      computeCurrentAccountBalance(snapshot, "2026-06-13", incomes, [], payments)
    ).toBe(2650);
  });

  it("não conta movimentos no mesmo dia da conferência", () => {
    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d1",
        label: "Aluguel",
        amount: 800,
        paidDate: "2026-06-10",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
    ];

    const movements = sumMovementsSinceSnapshot(
      snapshot,
      "2026-06-13",
      [],
      [],
      payments
    );

    expect(movements.registeredPayments).toBe(0);
    expect(computeCurrentAccountBalance(snapshot, "2026-06-13", [], [], payments)).toBe(
      2450
    );
  });

  it("calcula disponível a partir do saldo em conta", () => {
    const available = computeAvailableFromAccountBalance(2650, 300, 160, 21);

    expect(available).toBe(2169);
  });

  it("desconta gastos lançados depois da conferência", () => {
    const expenses: AdHocExpense[] = [
      {
        id: "e1",
        name: "Mercado",
        amount: 120,
        date: "2026-06-11",
        active: true,
      },
    ];

    expect(
      computeCurrentAccountBalance(snapshot, "2026-06-13", [], expenses, [])
    ).toBe(2330);
  });
});
