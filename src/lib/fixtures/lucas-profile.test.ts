import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "@/lib/finance/dashboard";
import { findNextIncomeAfter } from "@/lib/finance/cash-period";
import { simulatePurchase } from "@/lib/finance/purchase-simulation";
import {
  LUCAS_ACCOUNT_BALANCE,
  LUCAS_CREDIT_CARDS,
  LUCAS_DEBTS,
  LUCAS_GOALS,
  LUCAS_RECURRING,
  LUCAS_REGISTERED_PAYMENTS,
  LUCAS_VARIABLE,
  LUCAS_REFERENCE_MONTH,
  LUCAS_REFERENCE_YEAR,
  LUCAS_REFERENCE_DAY,
} from "@/lib/fixtures/lucas-profile";

function buildLucasDashboard(asOfDay = LUCAS_REFERENCE_DAY) {
  return buildDashboardSummary(
    LUCAS_RECURRING,
    LUCAS_VARIABLE,
    LUCAS_DEBTS,
    LUCAS_CREDIT_CARDS,
    LUCAS_GOALS,
    [],
    [],
    LUCAS_REGISTERED_PAYMENTS,
    LUCAS_ACCOUNT_BALANCE,
    LUCAS_REFERENCE_YEAR,
    LUCAS_REFERENCE_MONTH,
    asOfDay
  );
}

describe("perfil Lucas (jun/2026)", () => {
  it("cadastra entradas e saídas fixas do mês", () => {
    const dashboard = buildLucasDashboard();

    expect(dashboard.totalIncome).toBe(3636);
    expect(dashboard.totalFixedExpenses).toBe(1250);
    expect(dashboard.totalVariableExpenses).toBe(500);
    expect(dashboard.totalDebtPayments).toBe(0);
    expect(dashboard.totalCreditCardBills).toBe(450);
  });

  it("desconta fatura Nubank já paga na sobra do mês", () => {
    const dashboard = buildLucasDashboard();

    expect(dashboard.netBalance).toBe(1886);
    expect(dashboard.paidAlerts.some((a) => a.label.includes("Nubank"))).toBe(
      true
    );
  });

  it("dia 13: saldo R$ 2 e próximo vale dia 20", () => {
    const dashboard = buildLucasDashboard(13);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(2);
    expect(dashboard.cashPeriod.nextIncome?.dayOfMonth).toBe(20);
    expect(dashboard.cashPeriod.nextIncome?.amount).toBe(1750);

    const next = findNextIncomeAfter(
      LUCAS_RECURRING,
      LUCAS_REFERENCE_YEAR,
      LUCAS_REFERENCE_MONTH,
      13
    );
    expect(next?.amount).toBe(1750);
    expect(next?.date).toBe("2026-06-20");
  });

  it("dia 13: disponível apertado — compra de R$ 50 estoura", () => {
    const dashboard = buildLucasDashboard(13);
    const result = simulatePurchase(dashboard, {
      name: "Almoço",
      amount: 50,
    });

    expect(result.verdict).toBe("no");
    expect(result.availableAfter).toBeLessThan(0);
  });

  it("dia 20: vale entra e próxima entrada é condução dia 30", () => {
    const dashboard = buildLucasDashboard(20);

    expect(dashboard.cashPeriod.lastIncome?.amount).toBe(1750);
    expect(dashboard.cashPeriod.nextIncome?.name).toBe("Condução");
    expect(dashboard.cashPeriod.nextIncome?.amount).toBe(236);
    expect(dashboard.cashPeriod.currentAccountBalance).toBeGreaterThan(1000);
  });

  it("dia 5: cluster de saídas fixas aparece nos alertas", () => {
    const dashboard = buildLucasDashboard(5);

    const dayFiveAlerts = dashboard.upcomingAlerts.filter((a) => a.day === 5);
    const names = dayFiveAlerts.map((a) => a.label);

    expect(names).toContain("Academia");
    expect(names).toContain("Claro Flex");
    expect(names).toContain("Faculdade (até mar/28)");
  });
});
