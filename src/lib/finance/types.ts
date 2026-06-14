export type EntryType = "income" | "expense";

/** Lançamento fixo recorrente (receita ou despesa) em um dia do mês */
export interface RecurringEntry {
  id: string;
  name: string;
  type: EntryType;
  dayOfMonth: number; // 1-31
  defaultAmount: number;
  active: boolean;
}

/** Gasto avulso estimado por mês (sem dia fixo) */
export interface VariableBudget {
  id: string;
  name: string;
  monthlyEstimate: number;
  active: boolean;
}

/** Gasto avulso lançado em uma data (real ou planejado) */
export interface AdHocExpense {
  id: string;
  name: string;
  amount: number;
  /** ISO date YYYY-MM-DD — pode ser hoje, passado ou futuro */
  date: string;
  /** Categoria opcional (vincula a uma despesa variável) */
  variableBudgetId?: string;
  active: boolean;
}

/** Ganho avulso (freela, venda, presente — não recorrente) */
export interface AdHocIncome {
  id: string;
  name: string;
  amount: number;
  date: string;
  active: boolean;
}

export type PaymentTargetType = "debt" | "card" | "recurring";

/** Pagamento real registrado (inclui antecipado) */
export interface RegisteredPayment {
  id: string;
  targetType: PaymentTargetType;
  targetId: string;
  /** Nome salvo para exibição */
  label: string;
  amount: number;
  /** Data em que pagou */
  paidDate: string;
  /** Mês de referência da conta YYYY-MM */
  referenceMonth: string;
  paidEarly: boolean;
  active: boolean;
}

/** Dívida ativa com parcela mensal */
export interface ActiveDebt {
  id: string;
  name: string;
  /** Saldo devedor atual */
  remainingBalance: number;
  /** Valor da parcela mensal */
  monthlyPayment: number;
  dayOfMonth: number; // 1-31
  active: boolean;
}

/** Cartão de crédito com ciclo de fatura */
export interface CreditCard {
  id: string;
  name: string;
  /** Dia que a fatura fecha */
  closingDay: number;
  /** Dia que a fatura vence (pagamento) */
  dueDay: number;
  /** Valor estimado da fatura atual */
  estimatedBillAmount: number;
  /** Limite do cartão (opcional) */
  creditLimit?: number;
  active: boolean;
}

/** Saldo real em conta informado pelo usuário (ex.: app do banco) */
export interface AccountBalanceSnapshot {
  amount: number;
  /** Data em que conferiu o saldo no banco YYYY-MM-DD */
  asOfDate: string;
}

/** Meta financeira */
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  /** Data desejada para atingir (opcional) */
  targetDate?: string; // ISO date YYYY-MM-DD
  active: boolean;
}

/** Um evento em um dia específico dentro da projeção */
export interface ProjectionEvent {
  date: string; // YYYY-MM-DD
  name: string;
  type: EntryType;
  amount: number;
  /** true quando o evento é pagamento de dívida */
  isDebtPayment?: boolean;
  /** true quando o evento é pagamento de fatura de cartão */
  isCreditCardBill?: boolean;
  /** true quando o evento é fechamento de fatura (informativo) */
  isCreditCardClosing?: boolean;
}

/** Resumo de um mês projetado */
export interface MonthProjection {
  year: number;
  month: number; // 1-12
  label: string; // ex: "jun/2026"
  totalIncome: number;
  totalFixedExpenses: number;
  totalDebtPayments: number;
  totalVariableExpenses: number;
  netBalance: number; // entradas - saídas
  cumulativeBalance: number; // saldo acumulado desde o início
  /** Soma do saldo devedor de todas as dívidas ativas ao fim do mês */
  totalDebtRemaining: number;
  events: ProjectionEvent[];
}

/** Projeção de quitação de uma dívida */
export interface DebtProjection {
  debt: ActiveDebt;
  remaining: number;
  monthlyPayment: number;
  estimatedMonths: number | null;
  estimatedPayoffDate: string | null;
}

/** Resultado do cálculo de meta */
export interface GoalProjection {
  goal: FinancialGoal;
  remaining: number;
  monthlySurplus: number;
  estimatedMonths: number | null;
  estimatedDate: string | null; // YYYY-MM-DD
  onTrack: boolean | null; // null se não há targetDate
  monthsAheadOrBehind: number | null; // positivo = atrás, negativo = adiantado
  suggestions: GoalSuggestion[];
}

export interface GoalSuggestion {
  id: string;
  label: string;
  extraMonthlySavings: number;
  newEstimatedMonths: number | null;
  newEstimatedDate: string | null;
}

export interface ProjectionInput {
  recurringEntries: RecurringEntry[];
  variableBudgets: VariableBudget[];
  activeDebts: ActiveDebt[];
  /** Saldo inicial antes da projeção */
  startingBalance: number;
  /** Quantos meses projetar */
  monthsAhead: number;
  /** Mês/ano de início (default: mês atual) */
  startYear?: number;
  startMonth?: number;
}

export interface ProjectionResult {
  months: MonthProjection[];
  averageMonthlySurplus: number;
  totalIncome: number;
  totalExpenses: number;
  /** Soma do saldo devedor hoje (dívidas ativas) */
  totalActiveDebt: number;
  /** Total de parcelas de dívidas por mês (enquanto houver saldo) */
  totalMonthlyDebtPayments: number;
  debtProjections: DebtProjection[];
}
