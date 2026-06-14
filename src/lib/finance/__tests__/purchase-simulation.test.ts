import { describe, expect, it } from "vitest";
import {
  formatPurchaseVerdict,
  simulatePurchase,
} from "../purchase-simulation";
import type { DashboardSummary } from "../dashboard";

const baseSummary = {
  netBalance: 648,
  cashPeriod: {
    currentAccountBalance: 2000,
    availableToSpend: 600,
  },
} as DashboardSummary;

describe("simulatePurchase", () => {
  it("marca compra que estoura o disponível", () => {
    const result = simulatePurchase(baseSummary, {
      name: "Fone",
      amount: 800,
    });

    expect(result.verdict).toBe("no");
    expect(result.availableAfter).toBe(-200);
    expect(formatPurchaseVerdict(result, "direct")).toContain("estoura");
  });

  it("marca compra pequena como ok", () => {
    const result = simulatePurchase(baseSummary, {
      name: "Café",
      amount: 5,
    });

    expect(result.verdict).toBe("ok");
    expect(result.balanceAfter).toBe(1995);
  });

  it("usa a sobra do mês alinhada ao dashboard (inclui avulsos)", () => {
    const summary = {
      netBalance: 798,
      cashPeriod: {
        currentAccountBalance: 1850,
        availableToSpend: 450,
      },
    } as DashboardSummary;

    const result = simulatePurchase(summary, {
      name: "Tênis",
      amount: 200,
    });

    expect(result.monthlySurplusBefore).toBe(798);
    expect(result.monthlySurplusAfter).toBe(598);
    expect(result.availableAfter).toBe(250);
  });
});
