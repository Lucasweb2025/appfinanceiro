"use client";

import { useEffect, useState } from "react";
import type { VariableFormData } from "@/lib/finance/variable";
import { validateVariableBudget } from "@/lib/finance/variable";
import type { VariableBudget } from "@/lib/finance/types";

const emptyForm = (): VariableFormData => ({
  name: "",
  monthlyEstimate: 0,
  active: true,
});

export function VariableFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: VariableBudget;
  onClose: () => void;
  onSubmit: (data: VariableFormData) => void;
}) {
  const [form, setForm] = useState<VariableFormData>(
    initial
      ? {
          name: initial.name,
          monthlyEstimate: initial.monthlyEstimate,
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
            monthlyEstimate: initial.monthlyEstimate,
            active: initial.active,
          }
        : emptyForm()
    );
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateVariableBudget(form);
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
          {initial ? "Editar despesa variável" : "Nova despesa não fixa"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Estimativa mensal — mercado, lazer, transporte, etc.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Mercado, Lazer"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Estimativa mensal (R$)
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.monthlyEstimate || ""}
              onChange={(e) =>
                setForm({ ...form, monthlyEstimate: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="0,00"
            />
            {errors.monthlyEstimate ? (
              <p className="mt-1 text-sm text-rose-600">{errors.monthlyEstimate}</p>
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
