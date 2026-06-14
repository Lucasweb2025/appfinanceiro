import { describe, expect, it } from "vitest";
import {
  buildPaymentTargetOptions,
  findPaymentForTarget,
  paymentTargetKey,
} from "../registered-payment";
import type { ActiveDebt, RecurringEntry } from "../types";

const recurringEntries: RecurringEntry[] = [
  {
    id: "rent",
    name: "Aluguel",
    type: "expense",
    dayOfMonth: 10,
    defaultAmount: 800,
    active: true,
  },
];

describe("registered payment referenceMonth", () => {
  it("mantém mês da obrigação ao pagar no mês seguinte", () => {
    const options = buildPaymentTargetOptions(
      recurringEntries,
      [],
      [],
      2026,
      6
    );
    const rent = options.find((option) => option.targetId === "rent");
    expect(rent?.referenceMonth).toBe("2026-06");

    const payment = {
      id: "p1",
      targetType: "recurring" as const,
      targetId: "rent",
      label: "Aluguel",
      amount: 800,
      paidDate: "2026-07-05",
      referenceMonth: rent!.referenceMonth,
      paidEarly: false,
      active: true,
    };

    const found = findPaymentForTarget(
      [payment],
      "recurring",
      "rent",
      "2026-06"
    );

    expect(found?.id).toBe("p1");
    expect(
      paymentTargetKey(payment.targetType, payment.targetId, payment.referenceMonth)
    ).toBe("recurring:rent:2026-06");
  });
});
