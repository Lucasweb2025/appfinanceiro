import type {
  AccountBalanceSnapshot,
  ActiveDebt,
  AdHocExpense,
  AdHocIncome,
  CreditCard,
  FinancialGoal,
  GoalProjection,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "./types";
import { roundMoney, todayParts, toISODate } from "./utils";
import {
  buildCreditCardEventsForMonth,
  mapCreditCardsForDashboard,
  type CreditCardDashboardItem,
} from "./credit-card";
import {
  applyDebtPaymentsForMonth,
  getTotalActiveDebt,
  getTotalMonthlyDebtPayments,
  projectDebts,
} from "./debts";
import { projectGoalsWithSurplus } from "./goals";
import { sumAdHocExpensesInMonth } from "./ad-hoc-expense";
import { sumAdHocIncomesInMonth } from "./ad-hoc-income";
import { applyScheduledExpensesAfterPayments, findPaymentForAlert, findPaymentForTarget, resolvePaymentPresetKey } from "./registered-payment";
import { summarizeRecurringMonth } from "./recurring";
import { getActiveVariableBudgets, sumUntaggedAdHocExpensesInMonth, sumVariableExpenses, sumVariableExpensesWithLoggedInMonth } from "./variable";
import {
  buildCalendarMonth,
  buildCashPeriodSummary,
  type CalendarMonth,
  type CashPeriodSummary,
} from "./cash-period";
export interface DashboardAlert {
  date: string;
  day: number;
  label: string;
  amount: number;
  kind: "income" | "expense" | "debt" | "card-closing" | "card-due";
  isPaid?: boolean;
  paidDate?: string;
  paidEarly?: boolean;
  paymentPresetKey?: string;
}

export interface DashboardDebtItem {
  id: string;
  name: string;
  remaining: number;
  monthlyPayment: number;
  dayOfMonth: number;
  estimatedMonths: number | null;
  estimatedPayoffDate: string | null;
  isPaidThisMonth: boolean;
  paidDate?: string;
  paidEarly?: boolean;
}

export interface DashboardTimelineEvent {
  date: string;
  name: string;
  type: "income" | "expense";
  amount: number;
  isDebtPayment?: boolean;
  isCreditCardBill?: boolean;
  isCreditCardClosing?: boolean;
}

export interface DashboardSummary {
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalDebtPayments: number;
  totalCreditCardBills: number;
  totalExpenses: number;
  netBalance: number;
  totalActiveDebt: number;
  totalMonthlyDebtPayments: number;
  variableItems: Array<{ id: string; name: string; amount: number }>;
  debtItems: DashboardDebtItem[];
  creditCardItems: CreditCardDashboardItem[];
  monthlySurplus: number;
  goalProjections: GoalProjection[];
  upcomingAlerts: DashboardAlert[];
  paidAlerts: DashboardAlert[];
  timelineEvents: DashboardTimelineEvent[];
  cashPeriod: CashPeriodSummary;
  calendar: CalendarMonth;
}

function mapEventToAlert(event: DashboardTimelineEvent): DashboardAlert {
  let kind: DashboardAlert["kind"] = "expense";
  if (event.type === "income") kind = "income";
  else if (event.isDebtPayment) kind = "debt";
  else if (event.isCreditCardBill) kind = "card-due";
  else if (event.isCreditCardClosing) kind = "card-closing";

  return {
    date: event.date,
    day: Number(event.date.slice(8, 10)),
    label: event.name,
    amount: event.amount,
    kind,
  };
}

function buildUpcomingAlerts(
  events: DashboardTimelineEvent[],
  referenceDate: string,
  registeredPayments: RegisteredPayment[],
  recurringEntries: RecurringEntry[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[]
): { upcoming: DashboardAlert[]; paid: DashboardAlert[] } {
  const alerts = events
    .map(mapEventToAlert)
    .filter((event) => event.kind !== "card-closing" && event.kind !== "income")
    .map((alert) => {
      const payment = findPaymentForAlert(
        alert,
        registeredPayments,
        recurringEntries,
        activeDebts,
        creditCards
      );
      if (!payment) {
        return {
          ...alert,
          paymentPresetKey: resolvePaymentPresetKey(
            alert,
            recurringEntries,
            activeDebts,
            creditCards
          ),
        };
      }
      return {
        ...alert,
        isPaid: true,
        paidDate: payment.paidDate,
        paidEarly: payment.paidEarly,
      };
    })
    .sort((a, b) => {
      const aOverdue = a.date < referenceDate ? 0 : 1;
      const bOverdue = b.date < referenceDate ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return a.date.localeCompare(b.date);
    });

  return {
    upcoming: alerts.filter((alert) => !alert.isPaid).slice(0, 8),
    paid: alerts.filter((alert) => alert.isPaid),
  };
}

/** Monta o objeto completo do dashboard */
export function buildDashboardSummary(
  recurringEntries: RecurringEntry[],
  variableBudgets: VariableBudget[],
  activeDebts: ActiveDebt[],
  creditCards: CreditCard[],
  financialGoals: FinancialGoal[],
  adHocExpenses: AdHocExpense[],
  adHocIncomes: AdHocIncome[],
  registeredPayments: RegisteredPayment[],
  accountBalanceSnapshot: AccountBalanceSnapshot | null,
  year: number,
  month: number,
  asOfDay?: number
): DashboardSummary {
  const today = todayParts();
  const referenceDay =
    asOfDay ??
    (year === today.year && month === today.month ? today.day : 1);
  const referenceDate = toISODate(year, month, referenceDay);
  const base = summarizeRecurringMonth(recurringEntries, year, month);
  const totalVariableExpenses = sumVariableExpenses(variableBudgets);
  const variableItems = getActiveVariableBudgets(variableBudgets).map((budget) => ({
    id: budget.id,
    name: budget.name,
    amount: budget.monthlyEstimate,
  }));

  const balances = new Map(
    activeDebts
      .filter((d) => d.active)
      .map((d) => [d.id, roundMoney(d.remainingBalance)])
  );
  const { events: debtEvents, totalPaid: totalDebtPayments } =
    applyDebtPaymentsForMonth(year, month, activeDebts, balances);

  const { events: cardEvents, totalBills: totalCreditCardBills } =
    buildCreditCardEventsForMonth(year, month, creditCards);

  const debtItems: DashboardDebtItem[] = projectDebts(
    activeDebts,
    registeredPayments
  ).map((item) => {
    const referenceMonth = `${year}-${String(month).padStart(2, "0")}`;
    const payment = findPaymentForTarget(
      registeredPayments,
      "debt",
      item.debt.id,
      referenceMonth
    );
    return {
      id: item.debt.id,
      name: item.debt.name,
      remaining: item.remaining,
      monthlyPayment: item.monthlyPayment,
      dayOfMonth: item.debt.dayOfMonth,
      estimatedMonths: item.estimatedMonths,
      estimatedPayoffDate: item.estimatedPayoffDate,
      isPaidThisMonth: Boolean(payment),
      paidDate: payment?.paidDate,
      paidEarly: payment?.paidEarly,
    };
  });

  const timelineEvents = [...base.events, ...debtEvents, ...cardEvents].sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  const referenceMonthKey = `${year}-${String(month).padStart(2, "0")}`;
  const scheduledAfterPayments = applyScheduledExpensesAfterPayments(
    referenceMonthKey,
    base.totalFixedExpenses,
    totalDebtPayments,
    totalCreditCardBills,
    registeredPayments
  );

  const totalAdHocExpenses = sumAdHocExpensesInMonth(adHocExpenses, year, month);
  const totalAdHocIncomes = sumAdHocIncomesInMonth(adHocIncomes, year, month);
  const totalVariableWithLogged = sumVariableExpensesWithLoggedInMonth(
    variableBudgets,
    adHocExpenses,
    year,
    month
  );
  const totalUntaggedAdHoc = sumUntaggedAdHocExpensesInMonth(
    adHocExpenses,
    year,
    month
  );
  const totalIncome = roundMoney(base.totalIncome + totalAdHocIncomes);

  const totalExpenses = roundMoney(
    scheduledAfterPayments.fixedExpenses +
      scheduledAfterPayments.debtPayments +
      scheduledAfterPayments.creditCardBills +
      totalVariableWithLogged +
      totalUntaggedAdHoc
  );

  const netBalance = roundMoney(totalIncome - totalExpenses);

  const cashPeriod = buildCashPeriodSummary(
    recurringEntries,
    variableBudgets,
    activeDebts,
    creditCards,
    adHocExpenses,
    adHocIncomes,
    registeredPayments,
    accountBalanceSnapshot,
    year,
    month,
    referenceDay
  );

  const calendar = buildCalendarMonth(
    recurringEntries,
    variableBudgets,
    activeDebts,
    creditCards,
    adHocExpenses,
    adHocIncomes,
    registeredPayments,
    cashPeriod,
    year,
    month,
    year,
    month,
    referenceDay
  );

  const alertGroups = buildUpcomingAlerts(
    timelineEvents,
    referenceDate,
    registeredPayments,
    recurringEntries,
    activeDebts,
    creditCards
  );

  const referenceMonth = `${year}-${String(month).padStart(2, "0")}`;
  const creditCardItems = mapCreditCardsForDashboard(creditCards).map((card) => {
    const payment = findPaymentForTarget(
      registeredPayments,
      "card",
      card.id,
      referenceMonth
    );
    return {
      ...card,
      isPaidThisMonth: Boolean(payment),
      paidDate: payment?.paidDate,
      paidEarly: payment?.paidEarly,
    };
  });

  return {
    year,
    month,
    label: base.label,
    totalIncome,
    totalFixedExpenses: base.totalFixedExpenses,
    totalVariableExpenses,
    totalDebtPayments,
    totalCreditCardBills,
    totalExpenses,
    netBalance,
    monthlySurplus: netBalance,
    totalActiveDebt: getTotalActiveDebt(activeDebts),
    totalMonthlyDebtPayments: getTotalMonthlyDebtPayments(activeDebts),
    variableItems,
    debtItems,
    creditCardItems,
    goalProjections: projectGoalsWithSurplus(financialGoals, netBalance),
    upcomingAlerts: alertGroups.upcoming,
    paidAlerts: alertGroups.paid,
    timelineEvents,
    cashPeriod,
    calendar,
  };
}
