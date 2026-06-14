import type { AssistantTone } from "./assistant-tone";
import type { DashboardSummary } from "./dashboard";
import { buildCreditCardEventsForMonth } from "./credit-card";
import { applyDebtPaymentsForMonth, createDebtBalanceMap } from "./debts";
import { summarizeRecurringMonth } from "./recurring";
import { sumVariableExpenses } from "./variable";
import type {
  ActiveDebt,
  CreditCard,
  RecurringEntry,
  VariableBudget,
} from "./types";
import { addMonths, formatCurrency, roundMoney } from "./utils";

export type AssistantSeverity = "urgent" | "warning" | "info" | "success";

export type AssistantAction =
  | "settings-balance"
  | "dismiss-bank-reminder"
  | "register-payment";

export interface AssistantMessage {
  id: string;
  severity: AssistantSeverity;
  text: string;
  action?: AssistantAction;
  actionLabel?: string;
  paymentPresetKey?: string;
  referenceMonth?: string;
}

export interface AssistantSummary {
  messages: AssistantMessage[];
  headline: string;
}

export interface AssistantContext {
  tone: AssistantTone;
  bankReminderDismissed: boolean;
}

function pick(tone: AssistantTone, direct: string, gentle: string): string {
  return tone === "direct" ? direct : gentle;
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  const labels = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${Number(day)} ${labels[Number(month) - 1]}`;
}

export function computeNextMonthSurplus(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  year: number,
  month: number
): { label: string; netBalance: number } {
  const next = addMonths(year, month, 1);
  const base = summarizeRecurringMonth(recurringEntries, next.year, next.month);
  const totalVariable = sumVariableExpenses(variableBudgets);
  const balances = createDebtBalanceMap(activeDebts);
  const { totalPaid: debtPayments } = applyDebtPaymentsForMonth(
    next.year,
    next.month,
    activeDebts,
    balances
  );
  const { totalBills: cardBills } = buildCreditCardEventsForMonth(
    next.year,
    next.month,
    creditCards
  );

  const netBalance = roundMoney(
    base.totalIncome -
      base.totalFixedExpenses -
      totalVariable -
      debtPayments -
      cardBills
  );

  return { label: base.label, netBalance };
}

export function buildAssistantSummary(
  summary: DashboardSummary,
  context: AssistantContext,
  nextMonth: { label: string; netBalance: number }
): AssistantSummary {
  const { tone, bankReminderDismissed } = context;
  const period = summary.cashPeriod;
  const messages: AssistantMessage[] = [];

  if (!period.usesAccountBalance) {
    messages.push({
      id: "setup-balance",
      severity: "warning",
      text: pick(
        tone,
        "Cadastra o saldo do banco em Config. Sem isso o app não sabe seu bolso real.",
        "Configure o saldo em conta em Config. para o app acompanhar seu bolso real."
      ),
      action: "settings-balance",
      actionLabel: "Ir em Config.",
    });
  } else if (!bankReminderDismissed) {
    messages.push({
      id: "bank-sync",
      severity: "info",
      text: pick(
        tone,
        "Conferiu o extrato hoje? Lança gastos, pagamentos e ganhos — senão o saldo mente.",
        "Vale conferir o extrato e lançar gastos, pagamentos e ganhos do dia."
      ),
      action: "dismiss-bank-reminder",
      actionLabel: pick(tone, "Já lancei tudo", "Ok, lancei tudo"),
    });
  }

  const available = period.availableToSpend;
  const balance = period.currentAccountBalance;

  if (period.usesAccountBalance && balance !== null && balance < 0) {
    messages.push({
      id: "negative-balance",
      severity: "urgent",
      text: pick(
        tone,
        `Saldo em conta negativo (${formatCurrency(balance)}). Para de gastar até entrar dinheiro.`,
        `Seu saldo em conta está negativo (${formatCurrency(balance)}).`
      ),
    });
  } else if (available < 0) {
    messages.push({
      id: "negative-available",
      severity: "urgent",
      text: pick(
        tone,
        `Você está ${formatCurrency(Math.abs(available))} no vermelho até a próxima entrada. Segura o gasto.`,
        `Disponível negativo em ${formatCurrency(Math.abs(available))} até a próxima entrada.`
      ),
    });
  }

  const overdue = summary.upcomingAlerts.filter(
    (alert) =>
      alert.kind !== "income" &&
      alert.date < period.referenceDate &&
      alert.paymentPresetKey &&
      !alert.isPaid
  );

  for (const alert of overdue.slice(0, 2)) {
    messages.push({
      id: `overdue-${alert.date}-${alert.label}`,
      severity: "warning",
      text: pick(
        tone,
        `${alert.label} (${formatCurrency(alert.amount)}) venceu. Marca como pago ou o saldo está errado.`,
        `${alert.label} (${formatCurrency(alert.amount)}) ainda não foi marcado como pago.`
      ),
      action: "register-payment",
      actionLabel: "Já paguei",
      paymentPresetKey: alert.paymentPresetKey,
      referenceMonth: alert.date.slice(0, 7),
    });
  }

  const unpaidSoon = summary.upcomingAlerts.filter(
    (alert) =>
      alert.kind !== "income" &&
      alert.paymentPresetKey &&
      !alert.isPaid &&
      alert.date >= period.referenceDate
  );

  if (overdue.length === 0 && unpaidSoon.length > 0) {
    const next = unpaidSoon[0]!;
    messages.push({
      id: `upcoming-${next.date}-${next.label}`,
      severity: "info",
      text: pick(
        tone,
        `Próximo: ${next.label} (${formatCurrency(next.amount)}) dia ${next.day}.`,
        `Em breve: ${next.label} (${formatCurrency(next.amount)}) no dia ${next.day}.`
      ),
      action: "register-payment",
      actionLabel: "Já paguei",
      paymentPresetKey: next.paymentPresetKey,
      referenceMonth: next.date.slice(0, 7),
    });
  }

  if (period.incomeDayProjection) {
    const proj = period.incomeDayProjection;
    const remaining = proj.remainingAfterIncomeAndBills;
    if (remaining < 0) {
      messages.push({
        id: "income-day-tight",
        severity: "warning",
        text: pick(
          tone,
          `Dia ${formatShortDate(proj.incomeDate)} entra ${formatCurrency(proj.incomeAmount)}, mas depois das contas fixas falta ${formatCurrency(Math.abs(remaining))}.`,
          `Após o recebimento em ${formatShortDate(proj.incomeDate)}, as contas fixas deixam ${formatCurrency(Math.abs(remaining))} a descoberto.`
        ),
      });
    } else if (messages.every((m) => m.severity !== "urgent")) {
      messages.push({
        id: "income-day-ok",
        severity: "success",
        text: pick(
          tone,
          `Dia ${formatShortDate(proj.incomeDate)} entra ${formatCurrency(proj.incomeAmount)}. Depois das fixas, sobra ${formatCurrency(remaining)}.`,
          `No dia ${formatShortDate(proj.incomeDate)} entra ${formatCurrency(proj.incomeAmount)} — após as contas fixas, sobra ~${formatCurrency(remaining)}.`
        ),
      });
    }
  }

  if (nextMonth.netBalance < 0) {
    messages.push({
      id: "next-month-negative",
      severity: "warning",
      text: pick(
        tone,
        `${nextMonth.label} não fecha: falta ${formatCurrency(Math.abs(nextMonth.netBalance))}. Planeja agora.`,
        `${nextMonth.label}: sobra prevista negativa (${formatCurrency(nextMonth.netBalance)}).`
      ),
    });
  } else if (nextMonth.netBalance > 0 && nextMonth.netBalance < 300) {
    messages.push({
      id: "next-month-tight",
      severity: "info",
      text: pick(
        tone,
        `${nextMonth.label} fecha no aperto: sobra só ${formatCurrency(nextMonth.netBalance)}.`,
        `${nextMonth.label}: sobra prevista de ${formatCurrency(nextMonth.netBalance)}.`
      ),
    });
  }

  const topGoal = summary.goalProjections[0];
  if (topGoal && topGoal.estimatedMonths !== null && topGoal.estimatedMonths > 0) {
    messages.push({
      id: `goal-${topGoal.goal.id}`,
      severity: "info",
      text: pick(
        tone,
        `Meta ${topGoal.goal.name}: no ritmo atual, ${topGoal.estimatedMonths} mês(es) para chegar.`,
        `Meta ${topGoal.goal.name}: cerca de ${topGoal.estimatedMonths} mês(es) no ritmo atual.`
      ),
    });
  }

  if (
    messages.length === 0 ||
    (messages.length === 1 && messages[0]?.id === "bank-sync")
  ) {
    if (messages.length === 0) {
      messages.push({
        id: "all-ok",
        severity: "success",
        text: pick(
          tone,
          period.usesAccountBalance && balance !== null
            ? `Bolso ok: ${formatCurrency(balance)} em conta, ${formatCurrency(available)} disponível.`
            : `Bolso ok: ${formatCurrency(available)} disponível até a próxima entrada.`,
          period.usesAccountBalance && balance !== null
            ? `Tudo certo — saldo ${formatCurrency(balance)}, disponível ${formatCurrency(available)}.`
            : `Tudo certo por aqui — ${formatCurrency(available)} disponível até a próxima entrada.`
        ),
      });
    }
  }

  const limited = messages.slice(0, 4);
  const hasUrgent = limited.some((m) => m.severity === "urgent");
  const hasWarning = limited.some((m) => m.severity === "warning");

  const headline = pick(
    tone,
    hasUrgent ? "Atenção — bolso apertado" : hasWarning ? "Olha isso antes de gastar" : "Resumo de hoje",
    hasUrgent ? "Situação delicada" : hasWarning ? "Alguns pontos de atenção" : "Resumo do assistente"
  );

  return { messages: limited, headline };
}
