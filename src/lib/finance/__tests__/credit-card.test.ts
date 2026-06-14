import { describe, expect, it } from "vitest";
import { buildCreditCardEventsForMonth, validateCreditCard } from "../credit-card";
import type { CreditCard } from "../types";

const sampleCard: CreditCard = {
  id: "c1",
  name: "Nubank",
  closingDay: 25,
  dueDay: 3,
  estimatedBillAmount: 1200,
  active: true,
};

describe("buildCreditCardEventsForMonth", () => {
  it("gera fechamento e vencimento no mês", () => {
    const result = buildCreditCardEventsForMonth(2026, 6, [sampleCard]);

    expect(result.totalBills).toBe(1200);
    expect(result.events).toHaveLength(2);

    const closing = result.events.find((e) => e.isCreditCardClosing);
    const bill = result.events.find((e) => e.isCreditCardBill);
    expect(closing?.date).toBe("2026-06-25");
    expect(bill?.date).toBe("2026-06-03");
  });
});

describe("validateCreditCard", () => {
  it("rejeita fechamento inválido", () => {
    const errors = validateCreditCard({
      name: "Teste",
      closingDay: 0,
      dueDay: 3,
      estimatedBillAmount: 100,
      active: true,
    });

    expect(errors.some((e) => e.field === "closingDay")).toBe(true);
  });
});
