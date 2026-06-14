import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "@/lib/finance/dashboard";
import { buildCashPeriodSummary } from "@/lib/finance/cash-period";
import { simulatePurchase } from "@/lib/finance/purchase-simulation";
import {
  buildSyntheticProfiles,
  type SyntheticProfile,
} from "@/lib/fixtures/synthetic-profiles";

const PROFILE_COUNT = 120;
const RUNS_PER_PROFILE = 3;

function exerciseProfile(profile: SyntheticProfile, asOfDay: number) {
  const dashboard = buildDashboardSummary(
    profile.recurring,
    profile.variable,
    profile.debts,
    profile.creditCards,
    [],
    [],
    [],
    [],
    profile.accountBalance,
    2026,
    6,
    asOfDay
  );

  expect(Number.isFinite(dashboard.netBalance)).toBe(true);
  expect(Number.isFinite(dashboard.cashPeriod.availableToSpend)).toBe(true);
  expect(Number.isFinite(dashboard.cashPeriod.currentAccountBalance ?? 0)).toBe(
    true
  );

  const period = buildCashPeriodSummary(
    profile.recurring,
    profile.variable,
    profile.debts,
    profile.creditCards,
    [],
    [],
    [],
    profile.accountBalance,
    2026,
    6,
    asOfDay
  );

  expect(Number.isFinite(period.availableToSpend)).toBe(true);

  simulatePurchase(dashboard, {
    name: "Teste carga",
    amount: 25,
  });
}

describe("teste de carga — perfis sintéticos", () => {
  it(`processa ${PROFILE_COUNT} perfis × ${RUNS_PER_PROFILE} dias sem quebrar`, () => {
    const profiles = buildSyntheticProfiles(PROFILE_COUNT);
    const started = performance.now();

    for (const profile of profiles) {
      for (let run = 0; run < RUNS_PER_PROFILE; run++) {
        const asOfDay = 1 + ((profile.id + run * 7) % 28);
        exerciseProfile(profile, asOfDay);
      }
    }

    const elapsedMs = performance.now() - started;
    const totalRuns = PROFILE_COUNT * RUNS_PER_PROFILE;

    expect(totalRuns).toBe(360);
    expect(elapsedMs).toBeLessThan(15_000);

    // eslint-disable-next-line no-console
    console.log(
      `[carga] ${totalRuns} execuções em ${elapsedMs.toFixed(0)}ms (${(elapsedMs / totalRuns).toFixed(1)}ms/exec)`
    );
  });
});
