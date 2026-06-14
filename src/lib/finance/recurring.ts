import type { EntryType, RecurringEntry } from "./types";
import { clampDayToMonth, formatMonthLabel, roundMoney, toISODate } from "./utils";

export interface RecurringFormData {
  name: string;
  type: EntryType;
  dayOfMonth: number;
  defaultAmount: number;
  active: boolean;
}

export interface RecurringValidationError {
  field: keyof RecurringFormData;
  message: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalFixedExpenses: number;
  netBalance: number;
  events: Array<{
    date: string;
    name: string;
    type: EntryType;
    amount: number;
  }>;
}

export function validateRecurringEntry(
  data: RecurringFormData
): RecurringValidationError[] {
  const errors: RecurringValidationError[] = [];
  const name = data.name.trim();

  if (name.length < 2 || name.length > 60) {
    errors.push({
      field: "name",
      message: "Nome deve ter entre 2 e 60 caracteres.",
    });
  }

  if (!Number.isInteger(data.dayOfMonth) || data.dayOfMonth < 1 || data.dayOfMonth > 31) {
    errors.push({
      field: "dayOfMonth",
      message: "Dia deve ser entre 1 e 31.",
    });
  }

  if (!Number.isFinite(data.defaultAmount) || data.defaultAmount <= 0) {
    errors.push({
      field: "defaultAmount",
      message: "Valor deve ser maior que zero.",
    });
  }

  return errors;
}

export function summarizeRecurringMonth(
  entries: RecurringEntry[],
  year: number,
  month: number
): MonthSummary {
  const activeEntries = entries.filter((entry) => entry.active);
  const events = activeEntries
    .map((entry) => {
      const day = clampDayToMonth(year, month, entry.dayOfMonth);
      return {
        date: toISODate(year, month, day),
        name: entry.name,
        type: entry.type,
        amount: entry.defaultAmount,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = roundMoney(
    events
      .filter((event) => event.type === "income")
      .reduce((sum, event) => sum + event.amount, 0)
  );

  const totalFixedExpenses = roundMoney(
    events
      .filter((event) => event.type === "expense")
      .reduce((sum, event) => sum + event.amount, 0)
  );

  return {
    year,
    month,
    label: formatMonthLabel(year, month),
    totalIncome,
    totalFixedExpenses,
    netBalance: roundMoney(totalIncome - totalFixedExpenses),
    events,
  };
}

/** Entradas fixas que caíram depois da conferência do saldo (evita duplicar o que já estava no extrato) */
export function sumRecurringIncomesAfterSnapshot(
  entries: RecurringEntry[],
  afterDate: string,
  untilDate: string
): number {
  if (afterDate.localeCompare(untilDate) > 0) return 0;

  const [startYear, startMonth] = afterDate.split("-").map(Number);
  const [endYear, endMonth] = untilDate.split("-").map(Number);

  let year = startYear!;
  let month = startMonth!;
  let total = 0;

  while (year < endYear! || (year === endYear && month <= endMonth!)) {
    const summary = summarizeRecurringMonth(entries, year, month);
    for (const event of summary.events) {
      if (
        event.type === "income" &&
        event.date > afterDate &&
        event.date <= untilDate
      ) {
        total += event.amount;
      }
    }

    if (year === endYear && month === endMonth) break;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return roundMoney(total);
}
