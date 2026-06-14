import type {
  ActiveDebt,
  CreditCard,
  PaymentTargetType,
  RecurringEntry,
  RegisteredPayment,
} from "./types";
import { clampDayToMonth, roundMoney, toISODate } from "./utils";

export interface RegisteredPaymentFlowEvent {
  id: string;
  date: string;
  day: number;
  name: string;
  amount: number;
  type: "expense";
  kind: "registered-payment";
}

export interface RegisteredPaymentFormData {
  targetType: PaymentTargetType;
  targetId: string;
  label: string;
  amount: number;
  paidDate: string;
  referenceMonth: string;
  paidEarly: boolean;
  active: boolean;
}

export interface RegisteredPaymentValidationError {
  field: keyof RegisteredPaymentFormData;
  message: string;
}

export interface PaymentTargetOption {
  targetType: PaymentTargetType;
  targetId: string;
  label: string;
  defaultAmount: number;
  dueDay: number;
  referenceMonth: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REF_MONTH = /^\d{4}-\d{2}$/;

export function getActiveRegisteredPayments(
  payments: RegisteredPayment[]
): RegisteredPayment[] {
  return payments.filter((payment) => payment.active);
}

/** Mantém só o pagamento mais recente por conta/mês (evita duplicata) */
export function dedupeRegisteredPayments(
  payments: RegisteredPayment[]
): RegisteredPayment[] {
  const byKey = new Map<string, RegisteredPayment>();

  for (const payment of payments) {
    const key = `${payment.targetType}:${payment.targetId}:${payment.referenceMonth}`;
    const existing = byKey.get(key);
    if (!existing || payment.paidDate.localeCompare(existing.paidDate) >= 0) {
      byKey.set(key, payment);
    }
  }

  return [...byKey.values()];
}

export function paymentTargetKey(
  targetType: PaymentTargetType,
  targetId: string,
  referenceMonth: string
): string {
  return `${targetType}:${targetId}:${referenceMonth}`;
}

export function findPaymentForTarget(
  payments: RegisteredPayment[],
  targetType: PaymentTargetType,
  targetId: string,
  referenceMonth: string
): RegisteredPayment | undefined {
  const key = paymentTargetKey(targetType, targetId, referenceMonth);
  return dedupeRegisteredPayments(getActiveRegisteredPayments(payments)).find(
    (payment) =>
      paymentTargetKey(
        payment.targetType,
        payment.targetId,
        payment.referenceMonth
      ) === key
  );
}

export function findPaymentForAlert(
  alert: {
    date: string;
    kind: string;
    label: string;
  },
  payments: RegisteredPayment[],
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): RegisteredPayment | undefined {
  const referenceMonth = alert.date.slice(0, 7);
  const candidates = dedupeRegisteredPayments(
    getActiveRegisteredPayments(payments)
  ).filter((payment) => payment.referenceMonth === referenceMonth);

  for (const payment of candidates) {
    const scheduledDate = getScheduledDueDateForPayment(
      payment,
      recurringEntries,
      activeDebts,
      creditCards
    );
    if (scheduledDate !== alert.date) continue;

    if (alert.kind === "debt" && payment.targetType === "debt") {
      const debt = activeDebts.find((item) => item.id === payment.targetId);
      if (debt && alert.label.includes(debt.name)) return payment;
    }
    if (alert.kind === "card-due" && payment.targetType === "card") {
      const card = creditCards.find((item) => item.id === payment.targetId);
      if (card && alert.label.includes(card.name)) return payment;
    }
    if (alert.kind === "expense" && payment.targetType === "recurring") {
      const entry = recurringEntries.find((item) => item.id === payment.targetId);
      if (entry && alert.label === entry.name) return payment;
    }
  }

  return undefined;
}

export function resolvePaymentPresetKey(
  alert: {
    date: string;
    label: string;
    kind: string;
  },
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): string | undefined {
  if (alert.kind === "income" || alert.kind === "card-closing") {
    return undefined;
  }

  if (alert.kind === "debt") {
    const debt = activeDebts.find(
      (item) => item.active && alert.label.includes(item.name)
    );
    return debt ? `debt:${debt.id}` : undefined;
  }

  if (alert.kind === "card-due") {
    const card = creditCards.find(
      (item) => item.active && alert.label.includes(item.name)
    );
    return card ? `card:${card.id}` : undefined;
  }

  if (alert.kind === "expense") {
    const entry = recurringEntries.find(
      (item) =>
        item.active && item.type === "expense" && item.name === alert.label
    );
    return entry ? `recurring:${entry.id}` : undefined;
  }

  return undefined;
}

export function formatPaidLabel(payment: RegisteredPayment): string {
  return formatPaidDateLabel(payment.paidDate, payment.paidEarly);
}

export function formatPaidDateLabel(
  paidDate: string,
  paidEarly = false
): string {
  const [, month, day] = paidDate.split("-");
  const prefix = paidEarly ? "Pago antecipado" : "Já pago";
  return `${prefix} · dia ${Number(day)}/${Number(month)}`;
}

export function referenceMonthFromDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function validateRegisteredPayment(
  data: RegisteredPaymentFormData
): RegisteredPaymentValidationError[] {
  const errors: RegisteredPaymentValidationError[] = [];

  if (!data.targetId) {
    errors.push({ field: "targetId", message: "Selecione o que foi pago." });
  }

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    errors.push({
      field: "amount",
      message: "Valor deve ser maior que zero.",
    });
  }

  if (!ISO_DATE.test(data.paidDate)) {
    errors.push({
      field: "paidDate",
      message: "Informe a data do pagamento.",
    });
  }

  if (!REF_MONTH.test(data.referenceMonth)) {
    errors.push({
      field: "referenceMonth",
      message: "Mês de referência inválido.",
    });
  }

  return errors;
}

export function buildPaymentTargetOptions(
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  year: number,
  month: number
): PaymentTargetOption[] {
  const referenceMonth = `${year}-${String(month).padStart(2, "0")}`;
  const options: PaymentTargetOption[] = [];

  for (const entry of recurringEntries) {
    if (!entry.active || entry.type !== "expense") continue;
    options.push({
      targetType: "recurring",
      targetId: entry.id,
      label: entry.name,
      defaultAmount: entry.defaultAmount,
      dueDay: entry.dayOfMonth,
      referenceMonth,
    });
  }

  for (const debt of activeDebts) {
    if (!debt.active) continue;
    options.push({
      targetType: "debt",
      targetId: debt.id,
      label: `${debt.name} (parcela)`,
      defaultAmount: debt.monthlyPayment,
      dueDay: debt.dayOfMonth,
      referenceMonth,
    });
  }

  for (const card of creditCards) {
    if (!card.active || card.estimatedBillAmount <= 0) continue;
    options.push({
      targetType: "card",
      targetId: card.id,
      label: `${card.name} — fatura`,
      defaultAmount: card.estimatedBillAmount,
      dueDay: card.dueDay,
      referenceMonth,
    });
  }

  return options;
}

export function getScheduledDueDateForPayment(
  payment: RegisteredPayment,
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): string | null {
  const [year, month] = payment.referenceMonth.split("-").map(Number);
  if (!year || !month) return null;

  switch (payment.targetType) {
    case "recurring": {
      const entry = recurringEntries.find((item) => item.id === payment.targetId);
      if (!entry) return null;
      const day = clampDayToMonth(year, month, entry.dayOfMonth);
      return toISODate(year, month, day);
    }
    case "debt": {
      const debt = activeDebts.find((item) => item.id === payment.targetId);
      if (!debt) return null;
      const day = clampDayToMonth(year, month, debt.dayOfMonth);
      return toISODate(year, month, day);
    }
    case "card": {
      const card = creditCards.find((item) => item.id === payment.targetId);
      if (!card) return null;
      const day = clampDayToMonth(year, month, card.dueDay);
      return toISODate(year, month, day);
    }
    default:
      return null;
  }
}

function paymentCoversScheduledEvent(
  event: {
    date: string;
    type: "income" | "expense";
    kind: string;
  },
  payment: RegisteredPayment,
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): boolean {
  if (payment.referenceMonth !== event.date.slice(0, 7)) return false;

  const scheduledDate = getScheduledDueDateForPayment(
    payment,
    recurringEntries,
    activeDebts,
    creditCards
  );
  if (!scheduledDate || scheduledDate !== event.date) return false;

  switch (payment.targetType) {
    case "debt":
      return event.kind === "debt";
    case "card":
      return event.kind === "card-due";
    case "recurring":
      return event.kind === "recurring" && event.type === "expense";
    default:
      return false;
  }
}

export function mapRegisteredPaymentToFlowEvent(
  payment: RegisteredPayment
): RegisteredPaymentFlowEvent {
  const suffix = payment.paidEarly ? " (antecipado)" : " (pago)";
  return {
    id: `registered-payment-${payment.id}`,
    date: payment.paidDate,
    day: Number(payment.paidDate.slice(8, 10)),
    name: `${payment.label}${suffix}`,
    amount: payment.amount,
    type: "expense",
    kind: "registered-payment",
  };
}

export function applyRegisteredPaymentsToCycleEvents<
  T extends {
    date: string;
    day: number;
    name: string;
    amount: number;
    type: "income" | "expense";
    kind: string;
  },
>(
  cycleEvents: T[],
  payments: RegisteredPayment[],
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): T[] {
  const activePayments = dedupeRegisteredPayments(
    getActiveRegisteredPayments(payments)
  );
  const filtered = cycleEvents.filter(
    (event) =>
      !activePayments.some((payment) =>
        paymentCoversScheduledEvent(
          event,
          payment,
          recurringEntries,
          activeDebts,
          creditCards
        )
      )
  );

  const paymentEvents = activePayments.map(
    mapRegisteredPaymentToFlowEvent
  ) as unknown as T[];
  return [...filtered, ...paymentEvents].sort(
    (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)
  );
}

export function sumRegisteredPaymentsInRange(
  payments: RegisteredPayment[],
  startDate: string,
  endDate: string
): number {
  return roundMoney(
    getActiveRegisteredPayments(payments)
      .filter(
        (payment) =>
          payment.paidDate.localeCompare(startDate) >= 0 &&
          payment.paidDate.localeCompare(endDate) <= 0
      )
      .reduce((sum, payment) => sum + payment.amount, 0)
  );
}

export function sortRegisteredPaymentsNewestFirst(
  payments: RegisteredPayment[]
): RegisteredPayment[] {
  return [...payments].sort(
    (a, b) => b.paidDate.localeCompare(a.paidDate) || b.id.localeCompare(a.id)
  );
}
