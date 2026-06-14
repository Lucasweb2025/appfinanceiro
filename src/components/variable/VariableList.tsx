"use client";

import { Badge, Card } from "@/components/ui";
import {
  sortAdHocExpensesNewestFirst,
  sumAdHocExpensesForBudgetInMonth,
} from "@/lib/finance/ad-hoc-expense";
import type { AdHocExpense, VariableBudget } from "@/lib/finance/types";
import { formatCurrency, todayParts } from "@/lib/finance/utils";

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function VariableList({
  budgets,
  expenses,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  onToggleBudget,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onToggleExpense,
}: {
  budgets: VariableBudget[];
  expenses: AdHocExpense[];
  onAddBudget: () => void;
  onEditBudget: (budget: VariableBudget) => void;
  onDeleteBudget: (id: string) => void;
  onToggleBudget: (id: string) => void;
  onAddExpense: () => void;
  onEditExpense: (expense: AdHocExpense) => void;
  onDeleteExpense: (id: string) => void;
  onToggleExpense: (id: string) => void;
}) {
  const today = todayParts();
  const sortedExpenses = sortAdHocExpensesNewestFirst(expenses);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onAddExpense}
        className="w-full rounded-2xl bg-brand-600 py-4 text-center font-semibold text-white shadow-md shadow-brand-600/20"
      >
        + Registrar gasto
      </button>

      <Card title="Gastos lançados">
        {sortedExpenses.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Nenhum gasto lançado. Ex.: café R$ 21 amanhã.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sortedExpenses.map((expense) => {
              const category = budgets.find(
                (budget) => budget.id === expense.variableBudgetId
              );
              return (
                <li key={expense.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{expense.name}</p>
                      <Badge tone={expense.active ? "success" : "neutral"}>
                        {expense.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDisplayDate(expense.date)} · {formatCurrency(expense.amount)}
                      {category ? ` · ${category.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleExpense(expense.id)}
                      className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {expense.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditExpense(expense)}
                      className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="border-amber-100 bg-amber-50/50">
        <p className="text-sm text-amber-900">
          <strong>Estimativas mensais</strong> — quanto você prevê gastar no mês. Os
          gastos lançados acima descontam do &quot;disponível&quot; no Início.
        </p>
      </Card>

      <button
        type="button"
        onClick={onAddBudget}
        className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-center font-medium text-slate-600"
      >
        + Adicionar estimativa mensal
      </button>

      <Card title="Estimativas do mês">
        {budgets.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            Nenhuma estimativa cadastrada.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {budgets.map((budget) => {
              const spent = sumAdHocExpensesForBudgetInMonth(
                expenses,
                budget.id,
                today.year,
                today.month
              );
              const progress =
                budget.monthlyEstimate > 0
                  ? Math.min(100, Math.round((spent / budget.monthlyEstimate) * 100))
                  : 0;

              return (
                <li key={budget.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{budget.name}</p>
                      <Badge tone={budget.active ? "success" : "neutral"}>
                        {budget.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Previsto {formatCurrency(budget.monthlyEstimate)} · Gasto{" "}
                      {formatCurrency(spent)}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          progress > 100 ? "bg-rose-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleBudget(budget.id)}
                      className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {budget.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditBudget(budget)}
                      className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBudget(budget.id)}
                      className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
