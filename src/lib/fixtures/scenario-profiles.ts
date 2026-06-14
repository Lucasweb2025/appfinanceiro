import type {
  AccountBalanceSnapshot,
  AdHocExpense,
  AdHocIncome,
  ActiveDebt,
  CreditCard,
  FinancialGoal,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "@/lib/finance/types";
import { buildDashboardSummary } from "@/lib/finance/dashboard";
import { LUCAS_PROFILE, LUCAS_REFERENCE_MONTH_KEY } from "@/lib/fixtures/lucas-profile";

export interface ScenarioFixture {
  id: string;
  title: string;
  description: string;
  year: number;
  month: number;
  asOfDay: number;
  recurring: RecurringEntry[];
  variable: VariableBudget[];
  debts: ActiveDebt[];
  creditCards: CreditCard[];
  goals: FinancialGoal[];
  adHocExpenses: AdHocExpense[];
  adHocIncomes: AdHocIncome[];
  registeredPayments: RegisteredPayment[];
  accountBalance: AccountBalanceSnapshot | null;
}

const EMPTY_GOALS: FinancialGoal[] = [];

const lucasRecurring = LUCAS_PROFILE.recurring;
const lucasVariable = LUCAS_PROFILE.variable;
const lucasCard = LUCAS_PROFILE.creditCards;

const payRecurring = (
  id: string,
  label: string,
  amount: number,
  paidDate: string
): RegisteredPayment => ({
  id: `pay-${id}`,
  targetType: "recurring",
  targetId: id,
  label,
  amount,
  paidDate,
  referenceMonth: LUCAS_REFERENCE_MONTH_KEY,
  paidEarly: false,
  active: true,
});

const payCard = (
  cardId: string,
  label: string,
  amount: number,
  paidDate: string
): RegisteredPayment => ({
  id: `pay-${cardId}`,
  targetType: "card",
  targetId: cardId,
  label,
  amount,
  paidDate,
  referenceMonth: LUCAS_REFERENCE_MONTH_KEY,
  paidEarly: false,
  active: true,
});

/** Usuário novo: só fixos, sem saldo conferido ainda */
export const SCENARIO_NEW_USER: ScenarioFixture = {
  id: "new-user",
  title: "Usuário novo no dia 13",
  description: "Cadastrou fixos e variáveis, ainda não conferiu saldo em Config.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: [
    {
      id: "income-salary",
      name: "Salário",
      type: "income",
      dayOfMonth: 5,
      defaultAmount: 3400,
      active: true,
    },
    {
      id: "income-vale",
      name: "Vale",
      type: "income",
      dayOfMonth: 20,
      defaultAmount: 1750,
      active: true,
    },
    {
      id: "expense-rent",
      name: "Aluguel",
      type: "expense",
      dayOfMonth: 10,
      defaultAmount: 800,
      active: true,
    },
  ],
  variable: [{ id: "v-daily", name: "Dia a dia", monthlyEstimate: 600, active: true }],
  debts: [],
  creditCards: [],
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: null,
};

/** Lucas: meio do mês apertado, saldo R$ 2 conferido */
export const SCENARIO_LUCAS_TIGHT: ScenarioFixture = {
  id: "lucas-tight",
  title: "Lucas apertado dia 13",
  description: "Pagou Nubank; saldo real R$ 2 até o vale dia 20.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: LUCAS_PROFILE.registeredPayments,
  accountBalance: LUCAS_PROFILE.accountBalance,
};

/** Lucas: marcou tudo pago no mês e reconciliou saldo */
export const SCENARIO_LUCAS_ALL_PAID: ScenarioFixture = {
  id: "lucas-all-paid",
  title: "Lucas — junho quitado",
  description: "Faculdade, Claro, Academia, Nubank pagos; saldo conferido R$ 2.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [
    ...LUCAS_PROFILE.registeredPayments,
    payRecurring("expense-claro-5", "Claro Flex", 45, "2026-06-05"),
    payRecurring("expense-faculdade-5", "Faculdade (até mar/28)", 315, "2026-06-05"),
    payRecurring("expense-academia-5", "Academia", 234, "2026-06-05"),
  ],
  accountBalance: { amount: 2, asOfDate: "2026-06-13" },
};

/** Dia 5: cluster de saídas ainda não pagas */
export const SCENARIO_DAY5_CLUSTER: ScenarioFixture = {
  id: "day5-cluster",
  title: "Dia 5 sem pagamentos",
  description: "Várias contas vencem no dia 5 e ainda não foram marcadas como pagas.",
  year: 2026,
  month: 6,
  asOfDay: 5,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: null,
};

/** Cartão vence dia 15 e ainda não foi pago */
export const SCENARIO_CARD_DUE: ScenarioFixture = {
  id: "card-due",
  title: "Fatura Nubank pendente",
  description: "Dia 14; fatura vence amanhã e não foi registrada como paga.",
  year: 2026,
  month: 6,
  asOfDay: 14,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: { amount: 480, asOfDate: "2026-06-14" },
};

/** Empréstimo ativo com parcela mensal */
export const SCENARIO_WITH_DEBT: ScenarioFixture = {
  id: "with-debt",
  title: "Salário + empréstimo",
  description: "Parcela de dívida no dia 8; saldo conferido no dia 10.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: [
    {
      id: "income-salary",
      name: "Salário",
      type: "income",
      dayOfMonth: 5,
      defaultAmount: 3400,
      active: true,
    },
    {
      id: "expense-rent",
      name: "Aluguel",
      type: "expense",
      dayOfMonth: 10,
      defaultAmount: 800,
      active: true,
    },
  ],
  variable: [{ id: "v-daily", name: "Dia a dia", monthlyEstimate: 400, active: true }],
  debts: [
    {
      id: "debt-loan",
      name: "Empréstimo",
      remainingBalance: 1800,
      monthlyPayment: 300,
      dayOfMonth: 8,
      active: true,
    },
  ],
  creditCards: [],
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [
    {
      id: "pay-debt",
      targetType: "debt",
      targetId: "debt-loan",
      label: "Empréstimo (parcela)",
      amount: 300,
      paidDate: "2026-06-08",
      referenceMonth: LUCAS_REFERENCE_MONTH_KEY,
      paidEarly: false,
      active: true,
    },
    {
      id: "pay-rent",
      targetType: "recurring",
      targetId: "expense-rent",
      label: "Aluguel",
      amount: 800,
      paidDate: "2026-06-10",
      referenceMonth: LUCAS_REFERENCE_MONTH_KEY,
      paidEarly: false,
      active: true,
    },
  ],
  accountBalance: { amount: 2100, asOfDate: "2026-06-10" },
};

/** Freela entra depois da conferência do saldo */
export const SCENARIO_EXTRA_INCOME: ScenarioFixture = {
  id: "extra-income",
  title: "Freela após conferir saldo",
  description: "Conferiu saldo dia 10; freela cai dia 12.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: [
    {
      id: "income-salary",
      name: "Salário",
      type: "income",
      dayOfMonth: 5,
      defaultAmount: 3400,
      active: true,
    },
  ],
  variable: [],
  debts: [],
  creditCards: [],
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [
    {
      id: "income-freela",
      name: "Freela",
      amount: 500,
      date: "2026-06-12",
      active: true,
    },
  ],
  registeredPayments: [],
  accountBalance: { amount: 800, asOfDate: "2026-06-10" },
};

/** Comida lançada depois da conferência */
export const SCENARIO_FOOD_LOGGED: ScenarioFixture = {
  id: "food-logged",
  title: "Almoços lançados em Comida",
  description: "Saldo conferido dia 10; gastos tagueados em Comida depois.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: [],
  goals: EMPTY_GOALS,
  adHocExpenses: [
    {
      id: "food-1",
      name: "Almoço",
      amount: 35,
      date: "2026-06-11",
      variableBudgetId: "variable-food",
      active: true,
    },
    {
      id: "food-2",
      name: "Almoço",
      amount: 28,
      date: "2026-06-12",
      variableBudgetId: "variable-food",
      active: true,
    },
  ],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: { amount: 500, asOfDate: "2026-06-10" },
};

/** Dia 19: véspera do vale e do aluguel */
export const SCENARIO_BEFORE_VALE: ScenarioFixture = {
  id: "before-vale",
  title: "Véspera do vale",
  description: "Dia 19 com pouco saldo; vale e aluguel chegam amanhã.",
  year: 2026,
  month: 6,
  asOfDay: 19,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: LUCAS_PROFILE.registeredPayments,
  accountBalance: { amount: 80, asOfDate: "2026-06-19" },
};

/** Dia 21: vale entrou e aluguel/cursos pagos */
export const SCENARIO_AFTER_VALE: ScenarioFixture = {
  id: "after-vale",
  title: "Depois do vale",
  description: "Dia 21; vale recebido e contas do dia 20 pagas.",
  year: 2026,
  month: 6,
  asOfDay: 21,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [
    ...LUCAS_PROFILE.registeredPayments,
    payRecurring("expense-aluguel-20", "Aluguel", 550, "2026-06-20"),
    payRecurring("expense-cursos-20", "Cursos", 106, "2026-06-20"),
  ],
  accountBalance: { amount: 1094, asOfDate: "2026-06-21" },
};

/** Saldo zero conferido no meio do mês */
export const SCENARIO_ZERO_BALANCE: ScenarioFixture = {
  id: "zero-balance",
  title: "Saldo zero",
  description: "Conferiu R$ 0 no banco; espera vale dia 20.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: LUCAS_PROFILE.registeredPayments,
  accountBalance: { amount: 0, asOfDate: "2026-06-13" },
};

/** Só um recebimento no mês — ciclo longo */
export const SCENARIO_SINGLE_INCOME: ScenarioFixture = {
  id: "single-income",
  title: "Um salário por mês",
  description: "Só entra dia 30; período longo até a próxima entrada.",
  year: 2026,
  month: 6,
  asOfDay: 10,
  recurring: [
    {
      id: "income-only",
      name: "Salário",
      type: "income",
      dayOfMonth: 30,
      defaultAmount: 3400,
      active: true,
    },
    {
      id: "expense-rent",
      name: "Aluguel",
      type: "expense",
      dayOfMonth: 5,
      defaultAmount: 900,
      active: true,
    },
  ],
  variable: [{ id: "v-food", name: "Comida", monthlyEstimate: 450, active: true }],
  debts: [],
  creditCards: [],
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: { amount: 120, asOfDate: "2026-06-10" },
};

/** Pagou cartão antecipado antes do vencimento */
export const SCENARIO_CARD_PAID_EARLY: ScenarioFixture = {
  id: "card-paid-early",
  title: "Fatura paga antecipada",
  description: "Nubank pago dia 8; saldo conferido dia 13 com R$ 2.",
  year: 2026,
  month: 6,
  asOfDay: 13,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [
    payCard("card-nubank", "Nubank — fatura", 450, "2026-06-08"),
  ],
  accountBalance: { amount: 2, asOfDate: "2026-06-13" },
};

/** Início do mês — antes de qualquer vencimento */
export const SCENARIO_MONTH_START: ScenarioFixture = {
  id: "month-start",
  title: "Dia 1 do mês",
  description: "Início de junho; contas do dia 5 ainda não venceram.",
  year: 2026,
  month: 6,
  asOfDay: 1,
  recurring: lucasRecurring,
  variable: lucasVariable,
  debts: [],
  creditCards: lucasCard,
  goals: EMPTY_GOALS,
  adHocExpenses: [],
  adHocIncomes: [],
  registeredPayments: [],
  accountBalance: { amount: 1200, asOfDate: "2026-06-01" },
};

export const SCENARIO_PACK: ScenarioFixture[] = [
  SCENARIO_NEW_USER,
  SCENARIO_LUCAS_TIGHT,
  SCENARIO_LUCAS_ALL_PAID,
  SCENARIO_DAY5_CLUSTER,
  SCENARIO_CARD_DUE,
  SCENARIO_WITH_DEBT,
  SCENARIO_EXTRA_INCOME,
  SCENARIO_FOOD_LOGGED,
  SCENARIO_BEFORE_VALE,
  SCENARIO_AFTER_VALE,
  SCENARIO_ZERO_BALANCE,
  SCENARIO_SINGLE_INCOME,
  SCENARIO_CARD_PAID_EARLY,
  SCENARIO_MONTH_START,
];

export function buildScenarioDashboard(
  scenario: ScenarioFixture,
  asOfDay = scenario.asOfDay
) {
  return buildDashboardSummary(
    scenario.recurring,
    scenario.variable,
    scenario.debts,
    scenario.creditCards,
    scenario.goals,
    scenario.adHocExpenses,
    scenario.adHocIncomes,
    scenario.registeredPayments,
    scenario.accountBalance,
    scenario.year,
    scenario.month,
    asOfDay
  );
}
