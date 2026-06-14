import type {
  AccountBalanceSnapshot,
  ActiveDebt,
  AdHocExpense,
  AdHocIncome,
  CreditCard,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "./types";
import {
  computeAvailableFromAccountBalance,
  computeCurrentAccountBalance,
  sumMovementsSinceSnapshot,
  type BalanceMovementsSinceSnapshot,
} from "./account-balance";
import {
  filterAdHocExpensesInRange,
  sumAdHocExpensesInRange,
} from "./ad-hoc-expense";
import {
  filterAdHocIncomesInRange,
  sumAdHocIncomesInRange,
} from "./ad-hoc-income";
import {
  applyRegisteredPaymentsToCycleEvents,
  sumRegisteredPaymentsInRange,
} from "./registered-payment";
import { buildCreditCardEventsForMonth } from "./credit-card";
import { applyDebtPaymentsForMonth, createDebtBalanceMap } from "./debts";
import { summarizeRecurringMonth } from "./recurring";
import {
  sumUntaggedAdHocExpensesInRange,
  sumUntaggedAdHocExpensesUpcomingInRange,
  sumVariableCostForRemainingPeriod,
  sumVariableReserveForRange,
  sumVariableExpenses,
} from "./variable";
import {
  addMonths,
  clampDayToMonth,
  countDaysInclusive,
  daysInMonth,
  formatMonthLabel,
  roundMoney,
  toISODate,
} from "./utils";

export interface IncomeEvent {
  date: string;
  name: string;
  amount: number;
  dayOfMonth: number;
}

export interface CashPeriodFlowEvent {
  id: string;
  date: string;
  day: number;
  name: string;
  amount: number;
  type: "income" | "expense";
  kind: "income" | "recurring" | "debt" | "card-due" | "card-closing" | "logged" | "extra-income" | "registered-payment";
}

export interface CashPeriodSummary {
  referenceDate: string;
  referenceDayLabel: string;
  lastIncome: IncomeEvent | null;
  nextIncome: IncomeEvent | null;
  periodStartDate: string;
  periodEndDate: string;
  periodDays: number;
  daysRemaining: number;
  incomeReceived: number;
  extraIncomePast: number;
  extraIncomeUpcoming: number;
  extraIncomeTotal: number;
  expensesAlreadyPaid: number;
  expensesUpcoming: number;
  loggedExpensesPast: number;
  loggedExpensesUpcoming: number;
  loggedExpensesTotal: number;
  registeredPaymentsPast: number;
  registeredPaymentsUpcoming: number;
  cycleEvents: CashPeriodFlowEvent[];
  variableBudgetForPeriod: number;
  totalVariableMonthly: number;
  availableToSpend: number;
  availableAfterNextIncome: number | null;
  dailyBudget: number | null;
  periodEvents: CashPeriodFlowEvent[];
  hasIncomes: boolean;
  usesAccountBalance: boolean;
  accountBalanceSnapshot: AccountBalanceSnapshot | null;
  currentAccountBalance: number | null;
  balanceMovementsSinceSnapshot: BalanceMovementsSinceSnapshot | null;
  incomeDayProjection: IncomeDayProjection | null;
}

export interface UnpaidBillUntilIncome {
  label: string;
  amount: number;
  date: string;
  presetKey: string;
}

export interface IncomeDayProjection {
  incomeDate: string;
  incomeName: string;
  incomeAmount: number;
  unpaidBills: UnpaidBillUntilIncome[];
  unpaidBillsTotal: number;
  remainingAfterIncomeAndBills: number;
}

export interface CalendarDay {
  date: string | null;
  day: number | null;
  isToday: boolean;
  isInPeriod: boolean;
  isIncomeDay: boolean;
  hasIncome: boolean;
  hasExpense: boolean;
  events: CashPeriodFlowEvent[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  weekDayHeaders: string[];
  days: CalendarDay[];
}

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MONTH_NAMES = [
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

function getActiveIncomes(entries: RecurringEntry[]): RecurringEntry[] {
  return entries.filter((entry) => entry.active && entry.type === "income");
}

function formatDayLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTH_NAMES[Number(month) - 1]}`;
}

function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

function isDateBefore(a: string, b: string): boolean {
  return compareDates(a, b) < 0;
}

function isDateAfter(a: string, b: string): boolean {
  return compareDates(a, b) > 0;
}

function isDateOnOrBefore(a: string, b: string): boolean {
  return compareDates(a, b) <= 0;
}

function isDateOnOrAfter(a: string, b: string): boolean {
  return compareDates(a, b) >= 0;
}

/** Gera recebimentos de um mês a partir dos cadastros do usuário */
export function generateIncomeEventsForMonth(
  entries: RecurringEntry[],
  year: number,
  month: number
): IncomeEvent[] {
  return getActiveIncomes(entries)
    .map((entry) => {
      const day = clampDayToMonth(year, month, entry.dayOfMonth);
      return {
        date: toISODate(year, month, day),
        name: entry.name,
        amount: entry.defaultAmount,
        dayOfMonth: entry.dayOfMonth,
      };
    })
    .sort((a, b) => compareDates(a.date, b.date));
}

/** Coleta recebimentos em uma janela de ±2 meses para achar anterior/próximo */
function collectIncomeEventsAround(
  entries: RecurringEntry[],
  year: number,
  month: number
): IncomeEvent[] {
  const events: IncomeEvent[] = [];
  for (const offset of [-2, -1, 0, 1, 2]) {
    const target = addMonths(year, month, offset);
    events.push(...generateIncomeEventsForMonth(entries, target.year, target.month));
  }
  return events.sort((a, b) => compareDates(a.date, b.date));
}

export function findLastIncomeBefore(
  entries: RecurringEntry[],
  year: number,
  month: number,
  day: number
): IncomeEvent | null {
  const today = toISODate(year, month, day);
  const events = collectIncomeEventsAround(entries, year, month);
  const past = events.filter((event) => isDateOnOrBefore(event.date, today));
  return past.length > 0 ? past[past.length - 1]! : null;
}

export function findNextIncomeAfter(
  entries: RecurringEntry[],
  year: number,
  month: number,
  day: number
): IncomeEvent | null {
  const today = toISODate(year, month, day);
  const events = collectIncomeEventsAround(entries, year, month);
  return events.find((event) => isDateAfter(event.date, today)) ?? null;
}

function mapTimelineToFlowEvents(
  timeline: Array<{
    date: string;
    name: string;
    type: "income" | "expense";
    amount: number;
    isDebtPayment?: boolean;
    isCreditCardBill?: boolean;
    isCreditCardClosing?: boolean;
  }>
): CashPeriodFlowEvent[] {
  return timeline.map((event) => {
    let kind: CashPeriodFlowEvent["kind"] = "recurring";
    if (event.type === "income") kind = "income";
    else if (event.isDebtPayment) kind = "debt";
    else if (event.isCreditCardBill) kind = "card-due";
    else if (event.isCreditCardClosing) kind = "card-closing";

    return {
      id: `${kind}-${event.date}-${event.name}-${event.amount}`,
      date: event.date,
      day: Number(event.date.slice(8, 10)),
      name: event.name,
      amount: event.amount,
      type: event.type,
      kind,
    };
  });
}

function collectTimelineForMonth(
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  year: number,
  month: number
) {
  const base = summarizeRecurringMonth(recurringEntries, year, month);
  const balances = createDebtBalanceMap(activeDebts);
  const { events: debtEvents } = applyDebtPaymentsForMonth(
    year,
    month,
    activeDebts,
    balances
  );
  const { events: cardEvents } = buildCreditCardEventsForMonth(
    year,
    month,
    creditCards
  );

  return [...base.events, ...debtEvents, ...cardEvents].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function collectTimelineInRange(
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  startDate: string,
  endDate: string
): CashPeriodFlowEvent[] {
  const startYear = Number(startDate.slice(0, 4));
  const startMonth = Number(startDate.slice(5, 7));
  const endYear = Number(endDate.slice(0, 4));
  const endMonth = Number(endDate.slice(5, 7));

  const months: Array<{ year: number; month: number }> = [];
  let cursor = { year: startYear, month: startMonth };
  while (
    cursor.year < endYear ||
    (cursor.year === endYear && cursor.month <= endMonth)
  ) {
    months.push({ ...cursor });
    cursor = addMonths(cursor.year, cursor.month, 1);
  }

  const raw = months.flatMap(({ year, month }) =>
    collectTimelineForMonth(recurringEntries, activeDebts, creditCards, year, month)
  );

  return mapTimelineToFlowEvents(raw).filter(
    (event) =>
      isDateOnOrAfter(event.date, startDate) &&
      isDateOnOrBefore(event.date, endDate) &&
      !(event.kind === "card-closing" && event.amount === 0)
  );
}

function sumExpenses(events: CashPeriodFlowEvent[]): number {
  return roundMoney(
    events
      .filter((event) => event.type === "expense" && event.amount > 0)
      .reduce((sum, event) => sum + event.amount, 0)
  );
}

/** Saída que já saiu de fato — só pagamento registrado (não vencimento automático) */
function isCommittedPastExpense(event: CashPeriodFlowEvent): boolean {
  return event.kind === "registered-payment";
}

/** Conta agendada ainda não paga — reserva no disponível até o vencimento */
function isPlannedUpcomingExpense(event: CashPeriodFlowEvent): boolean {
  return (
    event.type === "expense" &&
    event.kind !== "registered-payment" &&
    event.kind !== "logged"
  );
}

function isScheduledBillKind(kind: CashPeriodFlowEvent["kind"]): boolean {
  return kind === "recurring" || kind === "debt" || kind === "card-due";
}

function resolvePresetKeyFromFlowEvent(
  event: CashPeriodFlowEvent,
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): string | undefined {
  if (event.kind === "debt") {
    const debt = activeDebts.find(
      (item) => item.active && event.name.includes(item.name)
    );
    return debt ? `debt:${debt.id}` : undefined;
  }

  if (event.kind === "card-due") {
    const card = creditCards.find(
      (item) => item.active && event.name.includes(item.name)
    );
    return card ? `card:${card.id}` : undefined;
  }

  if (event.kind === "recurring") {
    const entry = recurringEntries.find(
      (item) =>
        item.active && item.type === "expense" && item.name === event.name
    );
    return entry ? `recurring:${entry.id}` : undefined;
  }

  return undefined;
}

export function buildIncomeDayProjection(
  fullCycleEvents: CashPeriodFlowEvent[],
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  nextIncome: IncomeEvent,
  usesAccountBalance: boolean,
  currentAccountBalance: number | null,
  incomeReceived: number,
  extraIncomePast: number,
  extraIncomeUpcoming: number,
  loggedExpensesPast: number,
  expensesAlreadyPaid: number,
  cycleStart: string
): IncomeDayProjection {
  const unpaidBills = fullCycleEvents
    .filter(
      (event) =>
        isScheduledBillKind(event.kind) &&
        isDateOnOrAfter(event.date, cycleStart) &&
        isDateOnOrBefore(event.date, nextIncome.date)
    )
    .map((event) => {
      const presetKey = resolvePresetKeyFromFlowEvent(
        event,
        recurringEntries,
        activeDebts,
        creditCards
      );
      return presetKey
        ? {
            label: event.name,
            amount: event.amount,
            date: event.date,
            presetKey,
          }
        : null;
    })
    .filter((bill): bill is UnpaidBillUntilIncome => bill !== null);

  const unpaidBillsTotal = roundMoney(
    unpaidBills.reduce((sum, bill) => sum + bill.amount, 0)
  );

  const base = usesAccountBalance
    ? (currentAccountBalance ?? 0)
    : roundMoney(
        incomeReceived + extraIncomePast - loggedExpensesPast - expensesAlreadyPaid
      );

  return {
    incomeDate: nextIncome.date,
    incomeName: nextIncome.name,
    incomeAmount: nextIncome.amount,
    unpaidBills,
    unpaidBillsTotal,
    remainingAfterIncomeAndBills: roundMoney(
      base + nextIncome.amount + extraIncomeUpcoming - unpaidBillsTotal
    ),
  };
}

function mapAdHocIncomeToFlowEvents(incomes: AdHocIncome[]): CashPeriodFlowEvent[] {
  return incomes.map((income) => ({
    id: `extra-income-${income.id}`,
    date: income.date,
    day: Number(income.date.slice(8, 10)),
    name: income.name,
    amount: income.amount,
    type: "income" as const,
    kind: "extra-income" as const,
  }));
}

function mapAdHocToFlowEvents(expenses: AdHocExpense[]): CashPeriodFlowEvent[] {
  return expenses.map((expense) => ({
    id: `logged-${expense.id}`,
    date: expense.date,
    day: Number(expense.date.slice(8, 10)),
    name: expense.name,
    amount: expense.amount,
    type: "expense" as const,
    kind: "logged" as const,
  }));
}

function mergeFlowEvents(...groups: CashPeriodFlowEvent[][]): CashPeriodFlowEvent[] {
  return groups
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

/** Monta o resumo "até a próxima entrada" com base nos recebimentos cadastrados */
export function buildCashPeriodSummary(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  adHocExpenses: AdHocExpense[],
  adHocIncomes: AdHocIncome[],
  registeredPayments: RegisteredPayment[],
  accountBalanceSnapshot: AccountBalanceSnapshot | null,
  year: number,
  month: number,
  day: number
): CashPeriodSummary {
  const today = toISODate(year, month, day);
  const usesAccountBalance = accountBalanceSnapshot !== null;
  const balanceMovementsSinceSnapshot = accountBalanceSnapshot
    ? sumMovementsSinceSnapshot(
        accountBalanceSnapshot,
        today,
        recurringEntries,
        adHocIncomes,
        adHocExpenses,
        registeredPayments
      )
    : null;
  const currentAccountBalance = accountBalanceSnapshot
    ? computeCurrentAccountBalance(
        accountBalanceSnapshot,
        today,
        recurringEntries,
        adHocIncomes,
        adHocExpenses,
        registeredPayments
      )
    : null;
  const incomes = getActiveIncomes(recurringEntries);
  const lastIncome = findLastIncomeBefore(recurringEntries, year, month, day);
  const nextIncome = findNextIncomeAfter(recurringEntries, year, month, day);
  const totalVariableMonthly = sumVariableExpenses(variableBudgets);

  if (incomes.length === 0 || !nextIncome) {
    return {
      referenceDate: today,
      referenceDayLabel: formatDayLabel(today),
      lastIncome,
      nextIncome,
      periodStartDate: today,
      periodEndDate: today,
      periodDays: 1,
      daysRemaining: 1,
      incomeReceived: 0,
      extraIncomePast: 0,
      extraIncomeUpcoming: 0,
      extraIncomeTotal: 0,
      expensesAlreadyPaid: 0,
      expensesUpcoming: 0,
      loggedExpensesPast: 0,
      loggedExpensesUpcoming: 0,
      loggedExpensesTotal: 0,
      registeredPaymentsPast: 0,
      registeredPaymentsUpcoming: 0,
      cycleEvents: [],
      variableBudgetForPeriod: 0,
      totalVariableMonthly,
      availableToSpend: 0,
      availableAfterNextIncome: null,
      dailyBudget: null,
      periodEvents: [],
      hasIncomes: incomes.length > 0,
      usesAccountBalance,
      accountBalanceSnapshot,
      currentAccountBalance,
      balanceMovementsSinceSnapshot,
      incomeDayProjection: null,
    };
  }

  const cycleStart = lastIncome?.date ?? today;
  const periodEndDate = nextIncome.date;
  const periodDays = countDaysInclusive(today, periodEndDate);
  const daysRemaining = periodDays;

  const rawCycleEvents = collectTimelineInRange(
    recurringEntries,
    activeDebts,
    creditCards,
    cycleStart,
    periodEndDate
  );

  const cycleEvents = applyRegisteredPaymentsToCycleEvents(
    rawCycleEvents,
    registeredPayments,
    recurringEntries,
    activeDebts,
    creditCards
  );

  const cycleIncomeEvents = mapAdHocIncomeToFlowEvents(
    filterAdHocIncomesInRange(adHocIncomes, cycleStart, periodEndDate)
  );

  const fullCycleEvents = mergeFlowEvents(cycleEvents, cycleIncomeEvents);

  const periodEvents = fullCycleEvents.filter(
    (event) =>
      isDateOnOrAfter(event.date, today) && isDateOnOrBefore(event.date, periodEndDate)
  );

  const incomeReceived = lastIncome ? lastIncome.amount : 0;

  const extraIncomePast = sumAdHocIncomesInRange(
    adHocIncomes,
    cycleStart,
    today
  );

  const extraIncomeUpcoming = roundMoney(
    filterAdHocIncomesInRange(adHocIncomes, today, periodEndDate)
      .filter((income) => isDateAfter(income.date, today))
      .reduce((sum, income) => sum + income.amount, 0)
  );

  const extraIncomeTotal = roundMoney(extraIncomePast + extraIncomeUpcoming);

  const expensesAlreadyPaid = sumExpenses(
    fullCycleEvents.filter(
      (event) =>
        isCommittedPastExpense(event) &&
        isDateAfter(event.date, cycleStart) &&
        isDateOnOrBefore(event.date, today)
    )
  );

  const expensesUpcoming = sumExpenses(
    fullCycleEvents.filter(
      (event) =>
        isPlannedUpcomingExpense(event) &&
        isDateAfter(event.date, today) &&
        isDateBefore(event.date, periodEndDate)
    )
  );

  const registeredPaymentsPast = sumRegisteredPaymentsInRange(
    registeredPayments,
    cycleStart,
    today
  );

  const loggedExpensesPast = sumAdHocExpensesInRange(
    adHocExpenses,
    cycleStart,
    today
  );

  const loggedInPeriod = filterAdHocExpensesInRange(
    adHocExpenses,
    today,
    periodEndDate
  );
  const loggedExpensesUpcoming = roundMoney(
    loggedInPeriod
      .filter((expense) => isDateAfter(expense.date, today))
      .reduce((sum, expense) => sum + expense.amount, 0)
  );
  const loggedExpensesTotal = roundMoney(
    loggedExpensesPast + loggedExpensesUpcoming
  );

  const loggedFlowEvents = mapAdHocToFlowEvents(
    filterAdHocExpensesInRange(adHocExpenses, today, periodEndDate)
  );

  const monthDays = daysInMonth(year, month);
  const variableBudgetForPeriod = sumVariableReserveForRange(
    variableBudgets,
    adHocExpenses,
    today,
    periodEndDate,
    year,
    month
  );
  const variableCostForPeriod = sumVariableCostForRemainingPeriod(
    variableBudgets,
    adHocExpenses,
    cycleStart,
    today,
    periodEndDate,
    year,
    month
  );
  const untaggedInCycle = sumUntaggedAdHocExpensesInRange(
    adHocExpenses,
    cycleStart,
    periodEndDate
  );
  const untaggedUpcoming = sumUntaggedAdHocExpensesUpcomingInRange(
    adHocExpenses,
    today,
    periodEndDate
  );

  const availableToSpend = usesAccountBalance
    ? computeAvailableFromAccountBalance(
        currentAccountBalance ?? 0,
        expensesUpcoming,
        0,
        untaggedUpcoming
      )
    : roundMoney(
        incomeReceived +
          extraIncomePast -
          expensesAlreadyPaid -
          expensesUpcoming -
          variableCostForPeriod -
          untaggedInCycle
      );

  const availableAfterNextIncome = roundMoney(
    availableToSpend + nextIncome.amount + extraIncomeUpcoming
  );

  const dailyBudget =
    daysRemaining > 0 ? roundMoney(availableToSpend / daysRemaining) : null;

  const incomeDayProjection = buildIncomeDayProjection(
    fullCycleEvents,
    recurringEntries,
    activeDebts,
    creditCards,
    nextIncome,
    usesAccountBalance,
    currentAccountBalance,
    incomeReceived,
    extraIncomePast,
    extraIncomeUpcoming,
    loggedExpensesPast,
    expensesAlreadyPaid,
    cycleStart
  );

  return {
    referenceDate: today,
    referenceDayLabel: formatDayLabel(today),
    lastIncome,
    nextIncome,
    periodStartDate: today,
    periodEndDate,
    periodDays,
    daysRemaining,
    incomeReceived,
    extraIncomePast,
    extraIncomeUpcoming,
    extraIncomeTotal,
    expensesAlreadyPaid,
    expensesUpcoming,
    loggedExpensesPast,
    loggedExpensesUpcoming,
    loggedExpensesTotal,
    registeredPaymentsPast,
    registeredPaymentsUpcoming: 0,
    cycleEvents: fullCycleEvents,
    variableBudgetForPeriod,
    totalVariableMonthly,
    availableToSpend,
    availableAfterNextIncome,
    dailyBudget,
    periodEvents: mergeFlowEvents(periodEvents, loggedFlowEvents),
    hasIncomes: true,
    usesAccountBalance,
    accountBalanceSnapshot,
    currentAccountBalance,
    balanceMovementsSinceSnapshot,
    incomeDayProjection,
  };
}

/** Grade do calendário mensal com eventos e destaque do período */
export function buildCalendarMonth(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  adHocExpenses: AdHocExpense[],
  adHocIncomes: AdHocIncome[],
  registeredPayments: RegisteredPayment[],
  cashPeriod: CashPeriodSummary,
  year: number,
  month: number,
  todayYear: number,
  todayMonth: number,
  todayDay: number
): CalendarMonth {
  const monthDays = daysInMonth(year, month);
  const firstWeekDay = new Date(year, month - 1, 1).getDay();
  const monthStart = toISODate(year, month, 1);
  const monthEnd = toISODate(year, month, monthDays);
  const rawMonth = collectTimelineInRange(
    recurringEntries,
    activeDebts,
    creditCards,
    monthStart,
    monthEnd
  );
  const withPayments = applyRegisteredPaymentsToCycleEvents(
    rawMonth,
    registeredPayments,
    recurringEntries,
    activeDebts,
    creditCards
  );
  const monthTimeline = mergeFlowEvents(
    withPayments,
    mapAdHocToFlowEvents(filterAdHocExpensesInRange(adHocExpenses, monthStart, monthEnd)),
    mapAdHocIncomeToFlowEvents(filterAdHocIncomesInRange(adHocIncomes, monthStart, monthEnd))
  );

  const eventsByDate = new Map<string, CashPeriodFlowEvent[]>();
  for (const event of monthTimeline) {
    const list = eventsByDate.get(event.date) ?? [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  const incomeDates = new Set(
    generateIncomeEventsForMonth(recurringEntries, year, month).map((e) => e.date)
  );

  const days: CalendarDay[] = [];

  for (let i = 0; i < firstWeekDay; i++) {
    days.push({
      date: null,
      day: null,
      isToday: false,
      isInPeriod: false,
      isIncomeDay: false,
      hasIncome: false,
      hasExpense: false,
      events: [],
    });
  }

  for (let day = 1; day <= monthDays; day++) {
    const date = toISODate(year, month, day);
    const events = eventsByDate.get(date) ?? [];
    const hasIncome = events.some((e) => e.type === "income");
    const hasExpense = events.some(
      (e) => e.type === "expense" && e.amount > 0
    );
    const isInPeriod =
      cashPeriod.nextIncome !== null &&
      isDateOnOrAfter(date, cashPeriod.periodStartDate) &&
      isDateOnOrBefore(date, cashPeriod.periodEndDate);

    days.push({
      date,
      day,
      isToday: year === todayYear && month === todayMonth && day === todayDay,
      isInPeriod,
      isIncomeDay: incomeDates.has(date),
      hasIncome,
      hasExpense,
      events,
    });
  }

  return {
    year,
    month,
    label: formatMonthLabel(year, month),
    weekDayHeaders: WEEK_DAYS,
    days,
  };
}
