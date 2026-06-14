"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssistantTone } from "@/lib/finance/assistant-tone";
import type { DashboardSummary } from "@/lib/finance/dashboard";
import {
  formatPurchaseVerdict,
  simulatePurchase,
} from "@/lib/finance/purchase-simulation";
import { formatCurrency } from "@/lib/finance/utils";

export function PurchaseSimulationModal({
  open,
  tone,
  summary,
  onClose,
  onLaunchExpense,
}: {
  open: boolean;
  tone: AssistantTone;
  summary: DashboardSummary;
  onClose: () => void;
  onLaunchExpense: (name: string, amount: number) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setAmount("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const result = useMemo(() => {
    if (!open || !name.trim() || !amount || amount <= 0) return null;
    return simulatePurchase(summary, { name, amount: Number(amount) });
  }, [open, name, amount, summary]);

  if (!open) return null;

  const verdictText = result ? formatPurchaseVerdict(result, tone) : null;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/40 p-4 pb-28 touch-pan-y sm:pb-4"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-min justify-center sm:min-h-full sm:items-center">
        <div
          className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="simulate-purchase-title"
        >
          <h2
            id="simulate-purchase-title"
            className="text-lg font-bold text-slate-900"
          >
            Simular compra
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Não salva nada — só mostra o impacto no bolso.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                O quê?
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Fone, tênis..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Quanto? (hoje)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="0,00"
              />
            </div>
          </div>

          {result ? (
            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
              <Row
                label="Saldo em conta"
                before={result.balanceBefore}
                after={result.balanceAfter}
              />
              <Row
                label="Disponível agora"
                before={result.availableBefore}
                after={result.availableAfter}
              />
              <Row
                label="Sobra do mês"
                before={result.monthlySurplusBefore}
                after={result.monthlySurplusAfter}
              />
              <p
                className={`pt-2 font-medium ${
                  result.verdict === "no"
                    ? "text-rose-700"
                    : result.verdict === "caution"
                      ? "text-amber-800"
                      : "text-emerald-700"
                }`}
              >
                {verdictText}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {result ? (
              <button
                type="button"
                onClick={() => {
                  onLaunchExpense(result.name, result.amount);
                  onClose();
                }}
                className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white"
              >
                Lançar como gasto
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  before,
  after,
}: {
  label: string;
  before: number | null;
  after: number | null;
}) {
  if (before === null && after === null) return null;

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">
        {before !== null ? formatCurrency(before) : "—"} →{" "}
        <span
          className={
            after !== null && after < 0 ? "text-rose-600" : "text-slate-900"
          }
        >
          {after !== null ? formatCurrency(after) : "—"}
        </span>
      </span>
    </div>
  );
}
