import type { AssistantTone } from "./assistant-tone";
import type { DashboardSummary } from "./dashboard";
import { roundMoney } from "./utils";

export interface PurchaseSimulationInput {
  name: string;
  amount: number;
}

export type PurchaseVerdict = "ok" | "caution" | "no";

export interface PurchaseSimulationResult {
  name: string;
  amount: number;
  balanceBefore: number | null;
  balanceAfter: number | null;
  availableBefore: number;
  availableAfter: number;
  monthlySurplusBefore: number;
  monthlySurplusAfter: number;
  fitsUntilNextIncome: boolean;
  verdict: PurchaseVerdict;
}

function pick(tone: AssistantTone, direct: string, gentle: string): string {
  return tone === "direct" ? direct : gentle;
}

export function simulatePurchase(
  summary: DashboardSummary,
  input: PurchaseSimulationInput
): PurchaseSimulationResult {
  const amount = roundMoney(input.amount);
  const period = summary.cashPeriod;
  const balanceBefore = period.currentAccountBalance;
  const availableBefore = period.availableToSpend;
  const monthlySurplusBefore = summary.netBalance;

  const balanceAfter =
    balanceBefore !== null ? roundMoney(balanceBefore - amount) : null;
  const availableAfter = roundMoney(availableBefore - amount);
  const monthlySurplusAfter = roundMoney(monthlySurplusBefore - amount);
  const fitsUntilNextIncome = availableAfter >= 0;

  let verdict: PurchaseVerdict = "ok";
  if (availableAfter < 0 || (balanceAfter !== null && balanceAfter < 0)) {
    verdict = "no";
  } else if (monthlySurplusAfter < 0 || availableAfter < 100) {
    verdict = "caution";
  }

  return {
    name: input.name.trim(),
    amount,
    balanceBefore,
    balanceAfter,
    availableBefore,
    availableAfter,
    monthlySurplusBefore,
    monthlySurplusAfter,
    fitsUntilNextIncome,
    verdict,
  };
}

export function formatPurchaseVerdict(
  result: PurchaseSimulationResult,
  tone: AssistantTone
): string {
  if (result.verdict === "no") {
    return pick(
      tone,
      "Essa compra estoura o bolso até a próxima entrada. Não compra agora.",
      "Essa compra deixaria o disponível negativo — melhor esperar."
    );
  }

  if (result.verdict === "caution") {
    return pick(
      tone,
      result.monthlySurplusAfter < 0
        ? "Compra cabe no bolso, mas o mês fecha no vermelho. Pensa duas vezes."
        : "Compra cabe, mas fica apertado até a próxima entrada.",
      result.monthlySurplusAfter < 0
        ? "Cabe no disponível, mas a sobra do mês ficaria negativa."
        : "É possível, mas o disponível ficaria bem apertado."
    );
  }

  return pick(
    tone,
    "Pode comprar — bolso e mês aguentam.",
    "Tudo certo — essa compra cabe no seu planejamento."
  );
}
