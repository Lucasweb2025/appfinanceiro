"use client";

import { useEffect, useState } from "react";
import type { GoalFormData } from "@/lib/finance/goal-form";
import { validateFinancialGoal } from "@/lib/finance/goal-form";
import type { FinancialGoal } from "@/lib/finance/types";

const emptyForm = (): GoalFormData => ({
  name: "",
  targetAmount: 0,
  currentSaved: 0,
  targetDate: "",
  active: true,
});

export function GoalFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: FinancialGoal;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
}) {
  const [form, setForm] = useState<GoalFormData>(
    initial
      ? {
          name: initial.name,
          targetAmount: initial.targetAmount,
          currentSaved: initial.currentSaved,
          targetDate: initial.targetDate ?? "",
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
            targetAmount: initial.targetAmount,
            currentSaved: initial.currentSaved,
            targetDate: initial.targetDate ?? "",
            active: initial.active,
          }
        : emptyForm()
    );
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload: GoalFormData = {
      ...form,
      targetDate: form.targetDate?.trim() || undefined,
    };
    const validation = validateFinancialGoal(payload);
    if (validation.length > 0) {
      setErrors(Object.fromEntries(validation.map((e) => [e.field, e.message])));
      return;
    }
    onSubmit(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-slate-900">
          {initial ? "Editar meta" : "Nova meta"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          O app calcula em quantos meses você chega com a sobra mensal atual.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome da meta</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Notebook, Viagem"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Valor da meta (R$)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.targetAmount || ""}
                onChange={(e) =>
                  setForm({ ...form, targetAmount: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.targetAmount ? (
                <p className="mt-1 text-sm text-rose-600">{errors.targetAmount}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Já guardado (R$)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.currentSaved || ""}
                onChange={(e) =>
                  setForm({ ...form, currentSaved: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.currentSaved ? (
                <p className="mt-1 text-sm text-rose-600">{errors.currentSaved}</p>
              ) : null}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Data desejada (opcional)
            </span>
            <input
              type="date"
              value={form.targetDate ?? ""}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            {errors.targetDate ? (
              <p className="mt-1 text-sm text-rose-600">{errors.targetDate}</p>
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
