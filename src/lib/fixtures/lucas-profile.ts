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

/** Perfil real Lucas — jun/2026, saldo R$ 2 até o vale dia 20 */
export const LUCAS_REFERENCE_DAY = 13;
export const LUCAS_REFERENCE_YEAR = 2026;
export const LUCAS_REFERENCE_MONTH = 6;
export const LUCAS_REFERENCE_MONTH_KEY = "2026-06";

export const LUCAS_RECURRING: RecurringEntry[] = [
  {
    id: "income-salary-5",
    name: "Salário (dia 5)",
    type: "income",
    dayOfMonth: 5,
    defaultAmount: 1650,
    active: true,
  },
  {
    id: "income-vale-20",
    name: "Vale (dia 20)",
    type: "income",
    dayOfMonth: 20,
    defaultAmount: 1750,
    active: true,
  },
  {
    id: "income-conducao-30",
    name: "Condução",
    type: "income",
    dayOfMonth: 30,
    defaultAmount: 236,
    active: true,
  },
  {
    id: "expense-academia-5",
    name: "Academia",
    type: "expense",
    dayOfMonth: 5,
    defaultAmount: 234,
    active: true,
  },
  {
    id: "expense-claro-5",
    name: "Claro Flex",
    type: "expense",
    dayOfMonth: 5,
    defaultAmount: 45,
    active: true,
  },
  {
    id: "expense-faculdade-5",
    name: "Faculdade (até mar/28)",
    type: "expense",
    dayOfMonth: 5,
    defaultAmount: 315,
    active: true,
  },
  {
    id: "expense-aluguel-20",
    name: "Aluguel",
    type: "expense",
    dayOfMonth: 20,
    defaultAmount: 550,
    active: true,
  },
  {
    id: "expense-cursos-20",
    name: "Cursos",
    type: "expense",
    dayOfMonth: 20,
    defaultAmount: 106,
    active: true,
  },
];

export const LUCAS_CREDIT_CARDS: CreditCard[] = [
  {
    id: "card-nubank",
    name: "Nubank",
    closingDay: 8,
    dueDay: 15,
    estimatedBillAmount: 450,
    creditLimit: 450,
    active: true,
  },
];

export const LUCAS_VARIABLE: VariableBudget[] = [
  {
    id: "variable-food",
    name: "Comida",
    monthlyEstimate: 500,
    active: true,
  },
];

export const LUCAS_DEBTS: ActiveDebt[] = [];

export const LUCAS_GOALS: FinancialGoal[] = [];

export const LUCAS_AD_HOC_EXPENSES: AdHocExpense[] = [];

export const LUCAS_AD_HOC_INCOMES: AdHocIncome[] = [];

/** Fatura de jun/2026 já paga; limite usado — próximo pagamento no dia 5 */
export const LUCAS_REGISTERED_PAYMENTS: RegisteredPayment[] = [
  {
    id: "payment-nubank-2026-06",
    targetType: "card",
    targetId: "card-nubank",
    label: "Nubank — fatura",
    amount: 450,
    paidDate: "2026-06-08",
    referenceMonth: LUCAS_REFERENCE_MONTH_KEY,
    paidEarly: false,
    active: true,
  },
];

export const LUCAS_ACCOUNT_BALANCE: AccountBalanceSnapshot = {
  amount: 2,
  asOfDate: "2026-06-13",
};

export const LUCAS_PROFILE = {
  recurring: LUCAS_RECURRING,
  creditCards: LUCAS_CREDIT_CARDS,
  variable: LUCAS_VARIABLE,
  debts: LUCAS_DEBTS,
  goals: LUCAS_GOALS,
  adHocExpenses: LUCAS_AD_HOC_EXPENSES,
  adHocIncomes: LUCAS_AD_HOC_INCOMES,
  registeredPayments: LUCAS_REGISTERED_PAYMENTS,
  accountBalance: LUCAS_ACCOUNT_BALANCE,
} as const;
