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
  RecurringEntry,
  RegisteredPayment,
} from "../types";

const recurringIncomes: RecurringEntry[] = [
  {
    id: "salary",
    name: "Salário",
    type: "income",
    dayOfMonth: 20,
    defaultAmount: 1750,
    active: true,
  },
];

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
      [],
      incomes,
      [],
      payments
    );

    expect(movements.extraIncomes).toBe(500);
    expect(movements.registeredPayments).toBe(300);
    expect(movements.netChange).toBe(200);

    expect(
      computeCurrentAccountBalance(
        snapshot,
        "2026-06-13",
        [],
        incomes,
        [],
        payments
      )
    ).toBe(2650);
  });

  it("credita salário fixo depois da conferência do saldo", () => {
    expect(
      computeCurrentAccountBalance(
        snapshot,
        "2026-06-20",
        recurringIncomes,
        [],
        [],
        []
      )
    ).toBe(4200);
  });

  it("não desconta gasto lançado no mesmo dia da conferência", () => {
    const expenses: AdHocExpense[] = [
      {
        id: "e1",
        name: "Café",
        amount: 1,
        date: "2026-06-10",
        active: true,
      },
    ];

    expect(
      computeCurrentAccountBalance(snapshot, "2026-06-10", [], [], expenses, [])
    ).toBe(2450);
  });

  it("não desconta pagamento registrado no mesmo dia da conferência", () => {
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

    expect(
      computeCurrentAccountBalance(snapshot, "2026-06-10", [], [], [], payments)
    ).toBe(2450);
  });

  it("desconta pagamento registrado depois do dia da conferência", () => {
    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d1",
        label: "Aluguel",
        amount: 800,
        paidDate: "2026-06-11",
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
      [],
      payments
    );

    expect(movements.registeredPayments).toBe(800);
    expect(
      computeCurrentAccountBalance(snapshot, "2026-06-13", [], [], [], payments)
    ).toBe(1650);
  });

  it("mantém saldo conferido mesmo com pagamentos já marcados no mês", () => {
    const reconciled: AccountBalanceSnapshot = {
      amount: 2,
      asOfDate: "2026-06-13",
    };

    const payments: RegisteredPayment[] = [
      {
        id: "p-nubank",
        targetType: "card",
        targetId: "card-nubank",
        label: "Nubank — fatura",
        amount: 450,
        paidDate: "2026-06-08",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
      {
        id: "p-claro",
        targetType: "recurring",
        targetId: "expense-claro-5",
        label: "Claro Flex",
        amount: 45,
        paidDate: "2026-06-05",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
      {
        id: "p-faculdade",
        targetType: "recurring",
        targetId: "expense-faculdade-5",
        label: "Faculdade",
        amount: 315,
        paidDate: "2026-06-05",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
    ];

    expect(
      computeCurrentAccountBalance(
        reconciled,
        "2026-06-13",
        recurringIncomes,
        [],
        [],
        payments
      )
    ).toBe(2);
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
      computeCurrentAccountBalance(snapshot, "2026-06-13", [], [], expenses, [])
    ).toBe(2330);
  });
});
