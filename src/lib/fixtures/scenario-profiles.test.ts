import { describe, expect, it } from "vitest";
import { buildAssistantSummary } from "@/lib/finance/assistant";
import { simulatePurchase } from "@/lib/finance/purchase-simulation";
import {
  SCENARIO_PACK,
  SCENARIO_AFTER_VALE,
  SCENARIO_BEFORE_VALE,
  SCENARIO_CARD_DUE,
  SCENARIO_DAY5_CLUSTER,
  SCENARIO_EXTRA_INCOME,
  SCENARIO_FOOD_LOGGED,
  SCENARIO_LUCAS_ALL_PAID,
  SCENARIO_LUCAS_TIGHT,
  SCENARIO_MONTH_START,
  SCENARIO_NEW_USER,
  SCENARIO_SINGLE_INCOME,
  SCENARIO_WITH_DEBT,
  SCENARIO_ZERO_BALANCE,
  buildScenarioDashboard,
} from "@/lib/fixtures/scenario-profiles";

describe("pack de cenários fixos", () => {
  it("contém 14 perfis documentados", () => {
    expect(SCENARIO_PACK).toHaveLength(14);
    expect(new Set(SCENARIO_PACK.map((s) => s.id)).size).toBe(14);
  });

  it.each(SCENARIO_PACK.map((s) => [s.id, s] as const))(
    "%s monta dashboard sem NaN",
    (_id, scenario) => {
      const dashboard = buildScenarioDashboard(scenario);

      expect(Number.isFinite(dashboard.netBalance)).toBe(true);
      expect(Number.isFinite(dashboard.cashPeriod.availableToSpend)).toBe(true);
      if (scenario.accountBalance) {
        expect(Number.isFinite(dashboard.cashPeriod.currentAccountBalance ?? 0)).toBe(
          true
        );
      }
    }
  );
});

describe("cenários — usuário novo", () => {
  it("calcula disponível sem saldo conferido", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_NEW_USER);

    expect(dashboard.cashPeriod.usesAccountBalance).toBe(false);
    expect(dashboard.cashPeriod.availableToSpend).toBeGreaterThan(0);
    expect(dashboard.cashPeriod.nextIncome?.dayOfMonth).toBe(20);
  });
});

describe("cenários — Lucas apertado", () => {
  it("saldo e disponível batem com R$ 2 conferidos", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_LUCAS_TIGHT);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(2);
    expect(dashboard.cashPeriod.availableToSpend).toBe(2);
    expect(dashboard.netBalance).toBe(1886);
  });

  it("compra de R$ 50 estoura", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_LUCAS_TIGHT);
    const result = simulatePurchase(dashboard, { name: "Almoço", amount: 50 });

    expect(result.verdict).toBe("no");
  });
});

describe("cenários — junho quitado", () => {
  it("sobra do mês ignora contas já pagas", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_LUCAS_ALL_PAID);

    expect(dashboard.netBalance).toBe(2480);
    expect(dashboard.paidAlerts.length).toBeGreaterThanOrEqual(4);
    expect(dashboard.cashPeriod.currentAccountBalance).toBe(2);
  });
});

describe("cenários — dia 5", () => {
  it("lista cluster de saídas nos alertas", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_DAY5_CLUSTER);
    const dayFive = dashboard.upcomingAlerts.filter((a) => a.day === 5);

    expect(dayFive.map((a) => a.label)).toEqual(
      expect.arrayContaining(["Academia", "Claro Flex", "Faculdade (até mar/28)"])
    );
  });
});

describe("cenários — fatura pendente", () => {
  it("marca Nubank como alerta e reserva no disponível", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_CARD_DUE);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(480);
    expect(
      dashboard.upcomingAlerts.some((a) => a.label.includes("Nubank"))
    ).toBe(true);
    expect(dashboard.cashPeriod.availableToSpend).toBeLessThan(480);
  });
});

describe("cenários — empréstimo", () => {
  it("mantém saldo conferido após parcela e aluguel pagos", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_WITH_DEBT);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(2100);
    expect(dashboard.debtItems[0]?.remaining).toBeLessThan(1800);
    expect(dashboard.debtItems[0]?.isPaidThisMonth).toBe(true);
  });
});

describe("cenários — freela", () => {
  it("credita ganho extra depois da conferência", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_EXTRA_INCOME);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(1300);
  });
});

describe("cenários — comida lançada", () => {
  it("desconta almoços do saldo sem reservar variável em duplicata", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_FOOD_LOGGED);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(437);
    expect(dashboard.cashPeriod.availableToSpend).toBe(437);
  });
});

describe("cenários — véspera e pós-vale", () => {
  it("dia 19: pouco saldo até o vale", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_BEFORE_VALE);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(80);
    expect(dashboard.cashPeriod.nextIncome?.amount).toBe(1750);
  });

  it("dia 21: saldo conferido após vale e contas do dia 20", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_AFTER_VALE);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(1094);
    expect(dashboard.cashPeriod.lastIncome?.amount).toBe(1750);
  });
});

describe("cenários — extremos", () => {
  it("saldo zero: disponível zero no dia 13", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_ZERO_BALANCE);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(0);
    expect(dashboard.cashPeriod.availableToSpend).toBe(0);
  });

  it("um salário no mês: próxima entrada dia 30", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_SINGLE_INCOME);

    expect(dashboard.cashPeriod.nextIncome?.dayOfMonth).toBe(30);
    expect(dashboard.cashPeriod.currentAccountBalance).toBe(120);
  });

  it("dia 1: saldo conferido permanece", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_MONTH_START);

    expect(dashboard.cashPeriod.currentAccountBalance).toBe(1200);
    expect(dashboard.upcomingAlerts.some((a) => a.day === 5)).toBe(true);
  });
});

describe("cenários — assistente", () => {
  it("Lucas apertado gera alerta urgente ou aviso", () => {
    const dashboard = buildScenarioDashboard(SCENARIO_LUCAS_TIGHT);
    const summary = buildAssistantSummary(
      dashboard,
      SCENARIO_LUCAS_TIGHT.recurring,
      SCENARIO_LUCAS_TIGHT.variable,
      SCENARIO_LUCAS_TIGHT.debts,
      SCENARIO_LUCAS_TIGHT.creditCards,
      { tone: "direct", bankReminderDismissed: true }
    );

    expect(
      summary.messages.some((m) => m.severity === "urgent" || m.severity === "warning")
    ).toBe(true);
  });
});
