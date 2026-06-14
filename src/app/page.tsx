"use client";

import { useMemo, useState } from "react";
import { AdHocExpenseFormModal } from "@/components/variable/AdHocExpenseFormModal";
import { AdHocIncomeFormModal } from "@/components/movements/AdHocIncomeFormModal";
import { RegisteredPaymentFormModal } from "@/components/movements/RegisteredPaymentFormModal";
import { CreditCardFormModal } from "@/components/credit-cards/CreditCardFormModal";
import { CreditCardList } from "@/components/credit-cards/CreditCardList";
import { DebtFormModal } from "@/components/debts/DebtFormModal";
import { DebtList } from "@/components/debts/DebtList";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { GoalsScreen } from "@/components/goals/GoalList";
import { BottomNav, type AppTab } from "@/components/layout/BottomNav";
import { DashboardView } from "@/components/recurring/DashboardView";
import { RecurringFormModal } from "@/components/recurring/RecurringFormModal";
import { RecurringList } from "@/components/recurring/RecurringList";
import { SettingsView } from "@/components/settings/SettingsView";
import { VariableFormModal } from "@/components/variable/VariableFormModal";
import { VariableList } from "@/components/variable/VariableList";
import { PageShell } from "@/components/ui";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useActiveDebts } from "@/hooks/useActiveDebts";
import { useAdHocExpenses } from "@/hooks/useAdHocExpenses";
import { useAdHocIncomes } from "@/hooks/useAdHocIncomes";
import { useRegisteredPayments } from "@/hooks/useRegisteredPayments";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useRecurringEntries } from "@/hooks/useRecurringEntries";
import { useVariableBudgets } from "@/hooks/useVariableBudgets";
import { buildDashboardSummary } from "@/lib/finance/dashboard";
import type {
  ActiveDebt,
  AdHocExpense,
  AdHocIncome,
  CreditCard,
  EntryType,
  FinancialGoal,
  RecurringEntry,
  RegisteredPayment,
  VariableBudget,
} from "@/lib/finance/types";
import { todayParts } from "@/lib/finance/utils";

export default function HomePage() {
  const recurring = useRecurringEntries();
  const variable = useVariableBudgets();
  const adHocExpenses = useAdHocExpenses();
  const adHocIncomes = useAdHocIncomes();
  const registeredPayments = useRegisteredPayments();
  const accountBalance = useAccountBalance();
  const debts = useActiveDebts();
  const creditCards = useCreditCards();
  const financialGoals = useFinancialGoals();
  const [tab, setTab] = useState<AppTab>("home");
  const [filter, setFilter] = useState<EntryType | "all">("all");
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [variableModalOpen, setVariableModalOpen] = useState(false);
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPresetKey, setPaymentPresetKey] = useState<string | undefined>();
  const [editingRecurring, setEditingRecurring] = useState<RecurringEntry | undefined>();
  const [editingVariable, setEditingVariable] = useState<VariableBudget | undefined>();
  const [editingDebt, setEditingDebt] = useState<ActiveDebt | undefined>();
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>();
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | undefined>();
  const [editingExpense, setEditingExpense] = useState<AdHocExpense | undefined>();
  const [editingIncome, setEditingIncome] = useState<AdHocIncome | undefined>();
  const [editingPayment, setEditingPayment] = useState<RegisteredPayment | undefined>();

  function openPaymentModal(presetKey?: string) {
    setEditingPayment(undefined);
    setPaymentPresetKey(presetKey);
    setPaymentModalOpen(true);
  }

  const today = todayParts();
  const dashboard = useMemo(
    () =>
      buildDashboardSummary(
        recurring.entries,
        variable.budgets,
        debts.debts,
        creditCards.cards,
        financialGoals.goals,
        adHocExpenses.expenses,
        adHocIncomes.incomes,
        registeredPayments.payments,
        accountBalance.snapshot,
        today.year,
        today.month
      ),
    [
      recurring.entries,
      variable.budgets,
      debts.debts,
      creditCards.cards,
      financialGoals.goals,
      adHocExpenses.expenses,
      adHocIncomes.incomes,
      registeredPayments.payments,
      accountBalance.snapshot,
      today.year,
      today.month,
    ]
  );

  const ready =
    recurring.ready &&
    variable.ready &&
    adHocExpenses.ready &&
    adHocIncomes.ready &&
    registeredPayments.ready &&
    accountBalance.ready &&
    debts.ready &&
    creditCards.ready &&
    financialGoals.ready;

  function handleRestoreDefaults() {
    recurring.restoreDefaults();
    variable.restoreDefaults();
    debts.restoreDefaults();
    creditCards.restoreDefaults();
    financialGoals.restoreDefaults();
    adHocExpenses.restoreDefaults();
    adHocIncomes.restoreDefaults();
    registeredPayments.restoreDefaults();
    accountBalance.clearSnapshot();
  }

  function handleClearAll() {
    recurring.clearAll();
    variable.clearAll();
    adHocExpenses.clearAll();
    adHocIncomes.clearAll();
    registeredPayments.clearAll();
    accountBalance.clearSnapshot();
    debts.clearAll();
    creditCards.clearAll();
    financialGoals.clearAll();
  }

  const pageMeta = {
    home: {
      title: "Início",
      subtitle: "Até a próxima entrada, sobra do mês e metas.",
    },
    recurring: {
      title: "Lançamentos fixos",
      subtitle: "Recebimentos (dia + valor) e contas fixas do mês.",
    },
    variable: {
      title: "Variáveis e gastos",
      subtitle: "Lance gastos reais e acompanhe estimativas mensais.",
    },
    debts: {
      title: "Dívidas ativas",
      subtitle: "Empréstimos e parcelas — saldo, parcela e vencimento.",
    },
    cards: {
      title: "Cartões de crédito",
      subtitle: "Fechamento da fatura, vencimento e valor estimado.",
    },
    goals: {
      title: "Metas",
      subtitle: "Quanto falta e em quantos meses você chega.",
    },
    settings: {
      title: "Configurações",
      subtitle: "Preferências e dados do aplicativo.",
    },
  }[tab];

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-slate-500">Carregando App Finanças...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-24">
      <PageShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
        {tab === "home" ? (
          <DashboardView
            summary={dashboard}
            incomes={adHocIncomes.incomes}
            payments={registeredPayments.payments}
            onAddExpense={() => {
              setEditingExpense(undefined);
              setExpenseModalOpen(true);
            }}
            onAddIncome={() => {
              setEditingIncome(undefined);
              setIncomeModalOpen(true);
            }}
            onRegisterPayment={(presetKey) => openPaymentModal(presetKey)}
            onEditIncome={(income) => {
              setEditingIncome(income);
              setIncomeModalOpen(true);
            }}
            onDeleteIncome={adHocIncomes.deleteIncome}
            onEditPayment={(payment) => {
              setEditingPayment(payment);
              setPaymentPresetKey(undefined);
              setPaymentModalOpen(true);
            }}
            onDeletePayment={registeredPayments.deletePayment}
          />
        ) : tab === "recurring" ? (
          <RecurringList
            entries={recurring.entries}
            payments={registeredPayments.payments}
            filter={filter}
            onFilterChange={setFilter}
            onAdd={() => {
              setEditingRecurring(undefined);
              setRecurringModalOpen(true);
            }}
            onEdit={(entry) => {
              setEditingRecurring(entry);
              setRecurringModalOpen(true);
            }}
            onDelete={recurring.deleteEntry}
            onToggle={recurring.toggleActive}
            onRegisterPayment={(entryId) => openPaymentModal(`recurring:${entryId}`)}
          />
        ) : tab === "variable" ? (
          <VariableList
            budgets={variable.budgets}
            expenses={adHocExpenses.expenses}
            onAddBudget={() => {
              setEditingVariable(undefined);
              setVariableModalOpen(true);
            }}
            onEditBudget={(budget) => {
              setEditingVariable(budget);
              setVariableModalOpen(true);
            }}
            onDeleteBudget={variable.deleteBudget}
            onToggleBudget={variable.toggleActive}
            onAddExpense={() => {
              setEditingExpense(undefined);
              setExpenseModalOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setExpenseModalOpen(true);
            }}
            onDeleteExpense={adHocExpenses.deleteExpense}
            onToggleExpense={adHocExpenses.toggleActive}
          />
        ) : tab === "debts" ? (
          <DebtList
            debts={debts.debts}
            payments={registeredPayments.payments}
            onAdd={() => {
              setEditingDebt(undefined);
              setDebtModalOpen(true);
            }}
            onEdit={(debt) => {
              setEditingDebt(debt);
              setDebtModalOpen(true);
            }}
            onDelete={debts.deleteDebt}
            onToggle={debts.toggleActive}
            onRegisterPayment={(debtId) => openPaymentModal(`debt:${debtId}`)}
          />
        ) : tab === "cards" ? (
          <CreditCardList
            cards={creditCards.cards}
            payments={registeredPayments.payments}
            onAdd={() => {
              setEditingCard(undefined);
              setCardModalOpen(true);
            }}
            onEdit={(card) => {
              setEditingCard(card);
              setCardModalOpen(true);
            }}
            onDelete={creditCards.deleteCard}
            onToggle={creditCards.toggleActive}
            onRegisterPayment={(cardId) => openPaymentModal(`card:${cardId}`)}
          />
        ) : tab === "goals" ? (
          <GoalsScreen
            allGoals={financialGoals.goals}
            projections={dashboard.goalProjections}
            onAdd={() => {
              setEditingGoal(undefined);
              setGoalModalOpen(true);
            }}
            onEdit={(goal) => {
              setEditingGoal(goal);
              setGoalModalOpen(true);
            }}
            onDelete={financialGoals.deleteGoal}
            onToggle={financialGoals.toggleActive}
          />
        ) : (
          <SettingsView
            snapshot={accountBalance.snapshot}
            onSaveSnapshot={accountBalance.saveSnapshot}
            onClearSnapshot={accountBalance.clearSnapshot}
            onRestoreDefaults={handleRestoreDefaults}
            onClearAll={handleClearAll}
          />
        )}
      </PageShell>

      <BottomNav active={tab} onChange={setTab} />

      <RecurringFormModal
        open={recurringModalOpen}
        initial={editingRecurring}
        defaultType={filter === "expense" ? "expense" : "income"}
        onClose={() => setRecurringModalOpen(false)}
        onSubmit={(data) => {
          if (editingRecurring) recurring.updateEntry(editingRecurring.id, data);
          else recurring.createEntry(data);
        }}
      />

      <VariableFormModal
        open={variableModalOpen}
        initial={editingVariable}
        onClose={() => setVariableModalOpen(false)}
        onSubmit={(data) => {
          if (editingVariable) variable.updateBudget(editingVariable.id, data);
          else variable.createBudget(data);
        }}
      />

      <DebtFormModal
        open={debtModalOpen}
        initial={editingDebt}
        onClose={() => setDebtModalOpen(false)}
        onSubmit={(data) => {
          if (editingDebt) debts.updateDebt(editingDebt.id, data);
          else debts.createDebt(data);
        }}
      />

      <CreditCardFormModal
        open={cardModalOpen}
        initial={editingCard}
        onClose={() => setCardModalOpen(false)}
        onSubmit={(data) => {
          if (editingCard) creditCards.updateCard(editingCard.id, data);
          else creditCards.createCard(data);
        }}
      />

      <GoalFormModal
        open={goalModalOpen}
        initial={editingGoal}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={(data) => {
          if (editingGoal) financialGoals.updateGoal(editingGoal.id, data);
          else financialGoals.createGoal(data);
        }}
      />

      <AdHocExpenseFormModal
        open={expenseModalOpen}
        initial={editingExpense}
        budgets={variable.budgets}
        onClose={() => setExpenseModalOpen(false)}
        onSubmit={(data) => {
          if (editingExpense) adHocExpenses.updateExpense(editingExpense.id, data);
          else adHocExpenses.createExpense(data);
        }}
      />

      <AdHocIncomeFormModal
        open={incomeModalOpen}
        initial={editingIncome}
        onClose={() => setIncomeModalOpen(false)}
        onSubmit={(data) => {
          if (editingIncome) adHocIncomes.updateIncome(editingIncome.id, data);
          else adHocIncomes.createIncome(data);
        }}
      />

      <RegisteredPaymentFormModal
        open={paymentModalOpen}
        initial={editingPayment}
        presetTargetKey={paymentPresetKey}
        recurringEntries={recurring.entries}
        activeDebts={debts.debts}
        creditCards={creditCards.cards}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(data) => {
          if (editingPayment) registeredPayments.updatePayment(editingPayment.id, data);
          else registeredPayments.createPayment(data);
        }}
      />
    </main>
  );
}
