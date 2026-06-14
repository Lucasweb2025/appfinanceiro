"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildPaymentTargetOptions,
  getScheduledDueDateForPayment,
  referenceMonthFromDate,
  validateRegisteredPayment,
  type PaymentTargetOption,
  type RegisteredPaymentFormData,
} from "@/lib/finance/registered-payment";
import type {
  ActiveDebt,
  CreditCard,
  RecurringEntry,
  RegisteredPayment,
} from "@/lib/finance/types";
import { toISODate, todayParts } from "@/lib/finance/utils";

function defaultForm(referenceMonth: string): RegisteredPaymentFormData {
  const today = todayParts();
  return {
    targetType: "debt",
    targetId: "",
    label: "",
    amount: 0,
    paidDate: toISODate(today.year, today.month, today.day),
    referenceMonth,
    paidEarly: false,
    active: true,
  };
}

function targetKey(option: PaymentTargetOption): string {
  return `${option.targetType}:${option.targetId}`;
}

export function RegisteredPaymentFormModal({
  open,
  initial,
  recurringEntries,
  activeDebts,
  creditCards,
  presetTargetKey,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: RegisteredPayment;
  recurringEntries: RecurringEntry[];
  activeDebts: ActiveDebt[];
  creditCards: CreditCard[];
  presetTargetKey?: string;
  onClose: () => void;
  onSubmit: (data: RegisteredPaymentFormData) => void;
}) {
  const today = todayParts();
  const referenceMonth = `${today.year}-${String(today.month).padStart(2, "0")}`;

  const options = useMemo(
    () =>
      buildPaymentTargetOptions(
        recurringEntries,
        activeDebts,
        creditCards,
        today.year,
        today.month
      ),
    [recurringEntries, activeDebts, creditCards, today.year, today.month]
  );

  const [form, setForm] = useState<RegisteredPaymentFormData>(
    defaultForm(referenceMonth)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        targetType: initial.targetType,
        targetId: initial.targetId,
        label: initial.label,
        amount: initial.amount,
        paidDate: initial.paidDate,
        referenceMonth: initial.referenceMonth,
        paidEarly: initial.paidEarly,
        active: initial.active,
      });
    } else {
      const base = defaultForm(referenceMonth);
      if (presetTargetKey) {
        const option = options.find((item) => targetKey(item) === presetTargetKey);
        if (option) {
          setForm({
            ...base,
            targetType: option.targetType,
            targetId: option.targetId,
            label: option.label,
            amount: option.defaultAmount,
            referenceMonth: option.referenceMonth,
          });
        } else {
          setForm(base);
        }
      } else if (options[0]) {
        const first = options[0];
        setForm({
          ...base,
          targetType: first.targetType,
          targetId: first.targetId,
          label: first.label,
          amount: first.defaultAmount,
          referenceMonth: first.referenceMonth,
        });
      } else {
        setForm(base);
      }
    }
    setErrors({});
  }, [open, initial, presetTargetKey, options, referenceMonth]);

  function updatePaidEarly(next: RegisteredPaymentFormData): RegisteredPaymentFormData {
    if (!next.targetId) return next;
    const draft: RegisteredPayment = {
      id: "draft",
      targetType: next.targetType,
      targetId: next.targetId,
      label: next.label,
      amount: next.amount,
      paidDate: next.paidDate,
      referenceMonth: next.referenceMonth,
      paidEarly: false,
      active: true,
    };
    const dueDate = getScheduledDueDateForPayment(
      draft,
      recurringEntries,
      activeDebts,
      creditCards
    );
    return {
      ...next,
      paidEarly: dueDate ? next.paidDate < dueDate : false,
    };
  }

  if (!open) return null;

  function handleTargetChange(value: string) {
    const option = options.find((item) => targetKey(item) === value);
    if (!option) return;
    setForm((current) =>
      updatePaidEarly({
        ...current,
        targetType: option.targetType,
        targetId: option.targetId,
        label: option.label,
        amount: option.defaultAmount,
        referenceMonth: option.referenceMonth,
      })
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateRegisteredPayment({
      ...form,
      referenceMonth: referenceMonthFromDate(form.paidDate),
    });
    if (validation.length > 0) {
      setErrors(Object.fromEntries(validation.map((e) => [e.field, e.message])));
      return;
    }
    onSubmit({
      ...form,
      referenceMonth: referenceMonthFromDate(form.paidDate),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-slate-900">
          {initial ? "Editar pagamento" : "Registrar pagamento"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Informe quando pagou de fato — inclusive antecipado.
        </p>

        {options.length === 0 ? (
          <p className="mt-5 text-sm text-amber-700">
            Cadastre uma dívida, cartão ou despesa fixa antes de registrar pagamento.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">O que pagou</span>
              <select
                value={
                  form.targetId
                    ? `${form.targetType}:${form.targetId}`
                    : ""
                }
                onChange={(e) => handleTargetChange(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                {options.map((option) => (
                  <option key={targetKey(option)} value={targetKey(option)}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.targetId ? (
                <p className="mt-1 text-sm text-rose-600">{errors.targetId}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Valor pago (R$)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.amount ? (
                <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Data do pagamento</span>
              <input
                type="date"
                value={form.paidDate}
                onChange={(e) =>
                  setForm((current) =>
                    updatePaidEarly({ ...current, paidDate: e.target.value })
                  )
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {errors.paidDate ? (
                <p className="mt-1 text-sm text-rose-600">{errors.paidDate}</p>
              ) : null}
            </label>

            {form.paidEarly ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Pagamento <strong>antecipado</strong> em relação ao vencimento cadastrado.
              </p>
            ) : null}
          </div>
        )}

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
            disabled={options.length === 0}
            className="flex-1 rounded-2xl bg-rose-600 py-3 font-medium text-white disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
