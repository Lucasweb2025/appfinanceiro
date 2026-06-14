"use client";

import { useEffect, useState } from "react";
import type { AdHocExpenseFormData } from "@/lib/finance/ad-hoc-expense";
import { validateAdHocExpense } from "@/lib/finance/ad-hoc-expense";
import type { AdHocExpense, VariableBudget } from "@/lib/finance/types";
import { toISODate, todayParts } from "@/lib/finance/utils";

function defaultDate(): string {
  const today = todayParts();
  return toISODate(today.year, today.month, today.day);
}

const emptyForm = (): AdHocExpenseFormData => ({
  name: "",
  amount: 0,
  date: defaultDate(),
  variableBudgetId: undefined,
  active: true,
});

export function AdHocExpenseFormModal({
  open,
  initial,
  budgets,
  defaultDate: presetDate,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: AdHocExpense;
  budgets: VariableBudget[];
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (data: AdHocExpenseFormData) => void;
}) {
  const [form, setForm] = useState<AdHocExpenseFormData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name,
            amount: initial.amount,
            date: initial.date,
            variableBudgetId: initial.variableBudgetId,
            active: initial.active,
          }
        : {
            ...emptyForm(),
            date: presetDate ?? defaultDate(),
          }
    );
    setErrors({});
  }, [open, initial, presetDate]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateAdHocExpense(form);
    if (validation.length > 0) {
      setErrors(Object.fromEntries(validation.map((e) => [e.field, e.message])));
      return;
    }
    onSubmit(form);
    onClose();
  }

  const activeBudgets = budgets.filter((budget) => budget.active);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-slate-900">
          {initial ? "Editar gasto" : "Registrar gasto"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Café, mercado, Uber — hoje, ontem ou uma data futura (planejado).
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Café da manhã"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Valor (R$)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="0,00"
            />
            {errors.amount ? (
              <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Data</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            {errors.date ? (
              <p className="mt-1 text-sm text-rose-600">{errors.date}</p>
            ) : null}
          </label>

          {activeBudgets.length > 0 ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Categoria (opcional)
              </span>
              <select
                value={form.variableBudgetId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    variableBudgetId: e.target.value || undefined,
                  })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="">Sem categoria</option>
                {activeBudgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3 font-medium text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-brand-600 py-3 font-medium text-white"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
