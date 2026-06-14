"use client";

import { useEffect, useState } from "react";
import type { CreditCardFormData } from "@/lib/finance/credit-card";
import { validateCreditCard } from "@/lib/finance/credit-card";
import type { CreditCard } from "@/lib/finance/types";

const emptyForm = (): CreditCardFormData => ({
  name: "",
  closingDay: 25,
  dueDay: 3,
  estimatedBillAmount: 0,
  creditLimit: undefined,
  active: true,
});

export function CreditCardFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: CreditCard;
  onClose: () => void;
  onSubmit: (data: CreditCardFormData) => void;
}) {
  const [form, setForm] = useState<CreditCardFormData>(
    initial
      ? {
          name: initial.name,
          closingDay: initial.closingDay,
          dueDay: initial.dueDay,
          estimatedBillAmount: initial.estimatedBillAmount,
          creditLimit: initial.creditLimit,
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
            closingDay: initial.closingDay,
            dueDay: initial.dueDay,
            estimatedBillAmount: initial.estimatedBillAmount,
            creditLimit: initial.creditLimit,
            active: initial.active,
          }
        : emptyForm()
    );
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateCreditCard(form);
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
          {initial ? "Editar cartão" : "Novo cartão de crédito"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Fechamento da fatura, vencimento e valor estimado.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Ex.: Nubank, Itaú"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fechamento (dia)
              </span>
              <input
                type="number"
                min={1}
                max={31}
                value={form.closingDay}
                onChange={(e) =>
                  setForm({ ...form, closingDay: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.closingDay ? (
                <p className="mt-1 text-sm text-rose-600">{errors.closingDay}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Vencimento (dia)
              </span>
              <input
                type="number"
                min={1}
                max={31}
                value={form.dueDay}
                onChange={(e) =>
                  setForm({ ...form, dueDay: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.dueDay ? (
                <p className="mt-1 text-sm text-rose-600">{errors.dueDay}</p>
              ) : null}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Fatura estimada (R$)
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.estimatedBillAmount || ""}
              onChange={(e) =>
                setForm({ ...form, estimatedBillAmount: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            {errors.estimatedBillAmount ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.estimatedBillAmount}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Limite (R$) — opcional
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.creditLimit ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  creditLimit: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            {errors.creditLimit ? (
              <p className="mt-1 text-sm text-rose-600">{errors.creditLimit}</p>
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
