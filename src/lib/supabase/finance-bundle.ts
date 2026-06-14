import type { AssistantTone } from "@/lib/finance/assistant-tone";
import type {
  AccountBalanceSnapshot,
  ActiveDebt,
  AdHocExpense,
  AdHocIncome,
  CreditCard,
  FinancialGoal,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "@/lib/finance/types";
import { loadAccountBalance } from "@/lib/storage/account-balance-storage";
import { loadAdHocExpenses } from "@/lib/storage/ad-hoc-expense-storage";
import { loadAdHocIncomes } from "@/lib/storage/ad-hoc-income-storage";
import { loadAssistantTone } from "@/lib/storage/assistant-tone-storage";
import { loadCreditCards } from "@/lib/storage/credit-card-storage";
import { loadActiveDebts } from "@/lib/storage/debt-storage";
import { loadFinancialGoals } from "@/lib/storage/goal-storage";
import { loadRecurringEntries } from "@/lib/storage/recurring-storage";
import { loadRegisteredPayments } from "@/lib/storage/registered-payment-storage";
import { saveAccountBalance } from "@/lib/storage/account-balance-storage";
import { saveAdHocExpenses } from "@/lib/storage/ad-hoc-expense-storage";
import { saveAdHocIncomes } from "@/lib/storage/ad-hoc-income-storage";
import { saveAssistantTone } from "@/lib/storage/assistant-tone-storage";
import { saveCreditCards } from "@/lib/storage/credit-card-storage";
import { saveActiveDebts } from "@/lib/storage/debt-storage";
import { saveFinancialGoals } from "@/lib/storage/goal-storage";
import { saveRecurringEntries } from "@/lib/storage/recurring-storage";
import { saveRegisteredPayments } from "@/lib/storage/registered-payment-storage";
import { saveVariableBudgets } from "@/lib/storage/variable-storage";
import { loadVariableBudgets } from "@/lib/storage/variable-storage";

const BANK_REMINDER_KEY = "app-financas-bank-reminder-dismissed";

export interface FinanceDataBundle {
  version: 1;
  recurring: RecurringEntry[];
  variable: VariableBudget[];
  debts: ActiveDebt[];
  creditCards: CreditCard[];
  goals: FinancialGoal[];
  adHocExpenses: AdHocExpense[];
  adHocIncomes: AdHocIncome[];
  registeredPayments: RegisteredPayment[];
  accountBalance: AccountBalanceSnapshot | null;
  assistantTone: AssistantTone;
  bankReminderDismissed: string | null;
}

export function collectFinanceBundle(): FinanceDataBundle {
  return {
    version: 1,
    recurring: loadRecurringEntries(),
    variable: loadVariableBudgets(),
    debts: loadActiveDebts(),
    creditCards: loadCreditCards(),
    goals: loadFinancialGoals(),
    adHocExpenses: loadAdHocExpenses(),
    adHocIncomes: loadAdHocIncomes(),
    registeredPayments: loadRegisteredPayments(),
    accountBalance: loadAccountBalance(),
    assistantTone: loadAssistantTone(),
    bankReminderDismissed:
      typeof window !== "undefined"
        ? window.localStorage.getItem(BANK_REMINDER_KEY)
        : null,
  };
}

export function applyFinanceBundle(bundle: FinanceDataBundle): void {
  saveRecurringEntries(bundle.recurring);
  saveVariableBudgets(bundle.variable);
  saveActiveDebts(bundle.debts);
  saveCreditCards(bundle.creditCards);
  saveFinancialGoals(bundle.goals);
  saveAdHocExpenses(bundle.adHocExpenses);
  saveAdHocIncomes(bundle.adHocIncomes);
  saveRegisteredPayments(bundle.registeredPayments);
  saveAccountBalance(bundle.accountBalance);
  saveAssistantTone(bundle.assistantTone);

  if (bundle.bankReminderDismissed) {
    window.localStorage.setItem(BANK_REMINDER_KEY, bundle.bankReminderDismissed);
  } else {
    window.localStorage.removeItem(BANK_REMINDER_KEY);
  }
}
