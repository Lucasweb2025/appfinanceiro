"use client";

import { useEffect, useState } from "react";
import type { DebtFormData } from "@/lib/finance/debt-form";
import { validateActiveDebt } from "@/lib/finance/debt-form";
import type { ActiveDebt } from "@/lib/finance/types";

const emptyForm = (): DebtFormData => ({
  name: "",
  remainingBalance: 0,
  monthlyPayment: 0,
  dayOfMonth: 10,
  active: true,
});

export function DebtFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: ActiveDebt;
  onClose: () => void;
  onSubmit: (data: DebtFormData) => void;
}) {
  const [form, setForm] = useState<DebtFormData>(
    initial
      ? {
          name: initial.name,
          remainingBalance: initial.remainingBalance,
          monthlyPayment: initial.monthlyPayment,
          dayOfMonth: initial.dayOfMonth,
          active: initial.active,
        }
      : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name,
            remainingBalance: initial.remainingBalance,
            monthlyPayment: initial.monthlyPayment,
            dayOfMonth: initial.dayOfMonth,
            active: initial.active,
          }
        : emptyForm()
    );
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateActiveDebt(form);
    if (validation.length > 0) {
      setErrors(Object.fromEntries(validation.map((e) => [e.field, e.message])));
      return;
    }
    onSubmit(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-slate-900">
          {initial ? "Editar dívida" : "Nova dívida ativa"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Saldo devedor, parcela mensal e dia de vencimento.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Cartão, Empréstimo"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Saldo devedor hoje (R$)
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.remainingBalance || ""}
              onChange={(e) =>
                setForm({ ...form, remainingBalance: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            {errors.remainingBalance ? (
              <p className="mt-1 text-sm text-rose-600">{errors.remainingBalance}</p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Parcela (R$)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.monthlyPayment || ""}
                onChange={(e) =>
                  setForm({ ...form, monthlyPayment: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.monthlyPayment ? (
                <p className="mt-1 text-sm text-rose-600">{errors.monthlyPayment}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Vencimento (dia)</span>
              <input
                type="number"
                min={1}
                max={31}
                value={form.dayOfMonth}
                onChange={(e) =>
                  setForm({ ...form, dayOfMonth: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.dayOfMonth ? (
                <p className="mt-1 text-sm text-rose-600">{errors.dayOfMonth}</p>
              ) : null}
            </label>
          </div>
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
