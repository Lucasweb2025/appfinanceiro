import type { CreditCard, ProjectionEvent } from "./types";
import { clampDayToMonth, roundMoney, toISODate } from "./utils";

export interface CreditCardFormData {
  name: string;
  closingDay: number;
  dueDay: number;
  estimatedBillAmount: number;
  creditLimit?: number;
  active: boolean;
}

export interface CreditCardValidationError {
  field: keyof CreditCardFormData | "creditLimit";
  message: string;
}

export function getActiveCreditCards(cards: CreditCard[]): CreditCard[] {
  return cards.filter((card) => card.active);
}

export function validateCreditCard(
  data: CreditCardFormData
): CreditCardValidationError[] {
  const errors: CreditCardValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (
    !Number.isInteger(data.closingDay) ||
    data.closingDay < 1 ||
    data.closingDay > 31
  ) {
    errors.push({
      field: "closingDay",
      message: "Dia de fechamento deve ser entre 1 e 31.",
    });
  }

  if (!Number.isInteger(data.dueDay) || data.dueDay < 1 || data.dueDay > 31) {
    errors.push({
      field: "dueDay",
      message: "Dia de vencimento deve ser entre 1 e 31.",
    });
  }

  if (!Number.isFinite(data.estimatedBillAmount) || data.estimatedBillAmount < 0) {
    errors.push({
      field: "estimatedBillAmount",
      message: "Valor da fatura não pode ser negativo.",
    });
  }

  if (
    data.creditLimit !== undefined &&
    (!Number.isFinite(data.creditLimit) || data.creditLimit <= 0)
  ) {
    errors.push({
      field: "creditLimit",
      message: "Limite deve ser maior que zero.",
    });
  }

  return errors;
}

export function sumCreditCardBills(cards: CreditCard[]): number {
  return roundMoney(
    getActiveCreditCards(cards).reduce(
      (sum, card) => sum + card.estimatedBillAmount,
      0
    )
  );
}

/** Eventos do cartão no mês: fechamento (info) + vencimento (saída) */
export function buildCreditCardEventsForMonth(
  year: number,
  month: number,
  cards: CreditCard[]
): { events: ProjectionEvent[]; totalBills: number } {
  const events: ProjectionEvent[] = [];
  let totalBills = 0;

  for (const card of getActiveCreditCards(cards)) {
    const closingDay = clampDayToMonth(year, month, card.closingDay);
    events.push({
      date: toISODate(year, month, closingDay),
      name: `${card.name} — fechamento`,
      type: "expense",
      amount: 0,
      isCreditCardClosing: true,
    });

    if (card.estimatedBillAmount > 0) {
      const dueDay = clampDayToMonth(year, month, card.dueDay);
      const amount = roundMoney(card.estimatedBillAmount);
      totalBills = roundMoney(totalBills + amount);
      events.push({
        date: toISODate(year, month, dueDay),
        name: `${card.name} — fatura`,
        type: "expense",
        amount,
        isCreditCardBill: true,
      });
    }
  }

  return {
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
    totalBills,
  };
}

export interface CreditCardDashboardItem {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
  estimatedBillAmount: number;
  creditLimit?: number;
  isPaidThisMonth?: boolean;
  paidDate?: string;
  paidEarly?: boolean;
}

export function mapCreditCardsForDashboard(
  cards: CreditCard[]
): CreditCardDashboardItem[] {
  return getActiveCreditCards(cards).map((card) => ({
    id: card.id,
    name: card.name,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    estimatedBillAmount: card.estimatedBillAmount,
    creditLimit: card.creditLimit,
  }));
}
