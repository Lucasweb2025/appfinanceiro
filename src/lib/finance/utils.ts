const MONTH_LABELS = [
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

export function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month - 1]}/${year}`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Último dia válido do mês (ex: 31 em fev vira 28/29) */
export function clampDayToMonth(
  year: number,
  month: number,
  day: number
): number {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(Math.max(day, 1), lastDay);
}

export function addMonths(
  year: number,
  month: number,
  offset: number
): { year: number; month: number } {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseCurrencyInput(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
}

export function monthsBetween(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number
): number {
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

export function addMonthsToDate(
  year: number,
  month: number,
  day: number,
  monthsToAdd: number
): string {
  const target = addMonths(year, month, monthsToAdd);
  const safeDay = clampDayToMonth(target.year, target.month, day);
  return toISODate(target.year, target.month, safeDay);
}

export function todayParts(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function countDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(diff + 1, 1);
}
