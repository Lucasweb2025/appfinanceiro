"use client";

import { Badge, Card } from "@/components/ui";
import type { CashPeriodSummary } from "@/lib/finance/cash-period";
import type { AdHocIncome, RegisteredPayment } from "@/lib/finance/types";
import { sortAdHocIncomesNewestFirst } from "@/lib/finance/ad-hoc-income";
import { sortRegisteredPaymentsNewestFirst } from "@/lib/finance/registered-payment";
import { formatCurrency } from "@/lib/finance/utils";

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function CycleTimelineCard({ period }: { period: CashPeriodSummary }) {
  if (!period.lastIncome || period.cycleEvents.length === 0) return null;

  const sorted = [...period.cycleEvents].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <Card title="Histórico do ciclo (desde o último recebimento)">
      <p className="mb-4 text-sm text-slate-500">
        Desde {formatDisplayDate(period.lastIncome.date)} — entradas e saídas reais do
        período.
      </p>
      <ul className="space-y-3">
        {sorted.map((event) => {
          const isPaid = event.kind === "registered-payment";
          return (
          <li
            key={event.id}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
              isPaid ? "border border-emerald-100 bg-emerald-50/60" : "bg-slate-50"
            }`}
          >
            <div>
              <p className={`font-medium ${isPaid ? "text-slate-900" : "text-slate-900"}`}>
                {event.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatDisplayDate(event.date)}
                {isPaid ? " · já pago" : ""}
              </p>
            </div>
            <div className="text-right">
              {isPaid ? <Badge tone="success">Pago</Badge> : null}
              <p
                className={`font-bold ${
                  event.type === "income" ? "text-emerald-700" : "text-rose-600"
                } ${isPaid ? "line-through text-slate-400" : ""}`}
              >
                {event.type === "income" ? "+" : "−"}
                {formatCurrency(event.amount)}
              </p>
            </div>
          </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function MovementsListCard({
  incomes,
  payments,
  onEditIncome,
  onDeleteIncome,
  onEditPayment,
  onDeletePayment,
}: {
  incomes: AdHocIncome[];
  payments: RegisteredPayment[];
  onEditIncome: (income: AdHocIncome) => void;
  onDeleteIncome: (id: string) => void;
  onEditPayment: (payment: RegisteredPayment) => void;
  onDeletePayment: (id: string) => void;
}) {
  const sortedIncomes = sortAdHocIncomesNewestFirst(incomes);
  const sortedPayments = sortRegisteredPaymentsNewestFirst(payments);

  if (sortedIncomes.length === 0 && sortedPayments.length === 0) {
    return null;
  }

  return (
    <Card title="Ganhos e pagamentos registrados">
      <div className="space-y-6">
        {sortedIncomes.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-emerald-800">Ganhos extras</p>
            <ul className="divide-y divide-slate-100">
              {sortedIncomes.map((income) => (
                <li key={income.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{income.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDisplayDate(income.date)} · {formatCurrency(income.amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onEditIncome(income)}
                      className="rounded-lg bg-brand-50 px-2 py-1 text-xs text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteIncome(income.id)}
                      className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-700"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {sortedPayments.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-rose-800">Pagamentos</p>
            <ul className="divide-y divide-slate-100">
              {sortedPayments.map((payment) => (
                <li key={payment.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{payment.label}</p>
                      {payment.paidEarly ? (
                        <Badge tone="warning">Antecipado</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-500">
                      Pago {formatDisplayDate(payment.paidDate)} ·{" "}
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onEditPayment(payment)}
                      className="rounded-lg bg-brand-50 px-2 py-1 text-xs text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePayment(payment.id)}
                      className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-700"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
