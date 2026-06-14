import { describe, expect, it } from "vitest";
import { buildCashPeriodSummary } from "../cash-period";
import { applyRegisteredPaymentsToCycleEvents } from "../registered-payment";
import type {
  ActiveDebt,
  AdHocIncome,
  CreditCard,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "../types";

const lucasEntries: RecurringEntry[] = [
  {
    id: "2",
    name: "Recebimento dia 5",
    type: "income",
    dayOfMonth: 5,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "3",
    name: "Recebimento dia 20",
    type: "income",
    dayOfMonth: 20,
    defaultAmount: 1750,
    active: true,
  },
];

const activeDebts: ActiveDebt[] = [
  {
    id: "d2",
    name: "Empréstimo",
    remainingBalance: 1800,
    monthlyPayment: 300,
    dayOfMonth: 8,
    active: true,
  },
];

const creditCards: CreditCard[] = [
  {
    id: "c1",
    name: "Nubank",
    closingDay: 25,
    dueDay: 3,
    estimatedBillAmount: 1200,
    active: true,
  },
];

const variableBudgets: VariableBudget[] = [
  { id: "v1", name: "Dia a dia", monthlyEstimate: 600, active: true },
];

describe("spec 07 — ganhos e pagamentos", () => {
  it("ganho extra após recebimento aumenta o disponível", () => {
    const incomes: AdHocIncome[] = [
      {
        id: "i1",
        name: "Freela",
        amount: 500,
        date: "2026-06-12",
        active: true,
      },
    ];

    const period = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      incomes,
      [],
      null,
      2026,
      6,
      13
    );

    expect(period.extraIncomePast).toBe(500);
    expect(period.availableToSpend).toBeGreaterThan(1590);
  });

  it("registrar pagamento desconta do disponível na hora", () => {
    const withoutPayment = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      [],
      null,
      2026,
      6,
      13
    );

    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d2",
        label: "Empréstimo (parcela)",
        amount: 300,
        paidDate: "2026-06-13",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
    ];

    const withPayment = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      payments,
      null,
      2026,
      6,
      13
    );

    expect(withoutPayment.availableToSpend).toBeCloseTo(1590, 1);
    expect(withPayment.availableToSpend).toBeCloseTo(
      withoutPayment.availableToSpend - 300,
      1
    );
    expect(withPayment.expensesAlreadyPaid).toBe(300);
  });

  it("pagamento antecipado no dia 8 substitui vencimento e entra no ciclo do dia 5", () => {
    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d2",
        label: "Empréstimo (parcela)",
        amount: 300,
        paidDate: "2026-06-08",
        referenceMonth: "2026-06",
        paidEarly: false,
        active: true,
      },
    ];

    const period = buildCashPeriodSummary(
      lucasEntries,
      variableBudgets,
      activeDebts,
      creditCards,
      [],
      [],
      payments,
      null,
      2026,
      6,
      13
    );

    expect(period.registeredPaymentsPast).toBe(300);
    expect(period.expensesAlreadyPaid).toBe(300);
    expect(period.expensesUpcoming).toBe(0);
    expect(
      period.cycleEvents.some(
        (event) => event.kind === "registered-payment" && event.date === "2026-06-08"
      )
    ).toBe(true);
  });

  it("remove evento agendado quando há pagamento registrado", () => {
    const raw = [
      {
        id: "debt-scheduled",
        date: "2026-06-08",
        day: 8,
        name: "Empréstimo (parcela)",
        amount: 300,
        type: "expense" as const,
        kind: "debt" as const,
      },
    ];

    const payments: RegisteredPayment[] = [
      {
        id: "p1",
        targetType: "debt",
        targetId: "d2",
        label: "Empréstimo (parcela)",
        amount: 300,
        paidDate: "2026-06-08",
        referenceMonth: "2026-06",
        paidEarly: true,
        active: true,
      },
    ];

    const merged = applyRegisteredPaymentsToCycleEvents(
      raw,
      payments,
      [],
      activeDebts,
      []
    );

    expect(merged.filter((event) => event.kind === "debt")).toHaveLength(0);
    expect(merged.filter((event) => event.kind === "registered-payment")).toHaveLength(1);
  });
});
