"use client";

import { useEffect, useState } from "react";
import type { RecurringFormData } from "@/lib/finance/recurring";
import { validateRecurringEntry } from "@/lib/finance/recurring";
import type { EntryType, RecurringEntry } from "@/lib/finance/types";

const emptyForm = (type: EntryType): RecurringFormData => ({
  name: "",
  type,
  dayOfMonth: 1,
  defaultAmount: 0,
  active: true,
});

export function RecurringFormModal({
  open,
  initial,
  defaultType,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: RecurringEntry;
  defaultType: EntryType;
  onClose: () => void;
  onSubmit: (data: RecurringFormData) => void;
}) {
  const [form, setForm] = useState<RecurringFormData>(
    initial
      ? {
          name: initial.name,
          type: initial.type,
          dayOfMonth: initial.dayOfMonth,
          defaultAmount: initial.defaultAmount,
          active: initial.active,
        }
      : emptyForm(defaultType)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name,
            type: initial.type,
            dayOfMonth: initial.dayOfMonth,
            defaultAmount: initial.defaultAmount,
            active: initial.active,
          }
        : emptyForm(defaultType)
    );
    setErrors({});
  }, [open, initial, defaultType]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateRecurringEntry(form);
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
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-slate-900">
          {initial ? "Editar lançamento" : "Novo lançamento fixo"}
        </h3>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Aluguel"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Tipo</span>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as EntryType })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Dia do mês</span>
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

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Valor (R$)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.defaultAmount || ""}
              onChange={(e) =>
                setForm({ ...form, defaultAmount: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="0,00"
            />
            {errors.defaultAmount ? (
              <p className="mt-1 text-sm text-rose-600">{errors.defaultAmount}</p>
            ) : null}
          </label>
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
