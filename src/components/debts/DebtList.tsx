"use client";

import { PaidStatusBadge, paidRowClass, paidTextClass } from "@/components/movements/PaidStatus";
import { Badge, Card } from "@/components/ui";
import type { ActiveDebt, RegisteredPayment } from "@/lib/finance/types";
import { findPaymentForTarget } from "@/lib/finance/registered-payment";
import { projectDebtPayoff } from "@/lib/finance/debts";
import { formatCurrency, todayParts } from "@/lib/finance/utils";

export function DebtList({
  debts,
  payments,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onRegisterPayment,
}: {
  debts: ActiveDebt[];
  payments: RegisteredPayment[];
  onAdd: () => void;  onEdit: (debt: ActiveDebt) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onRegisterPayment?: (debtId: string) => void;
}) {
  const today = todayParts();
  const referenceMonth = `${today.year}-${String(today.month).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <Card className="border-rose-100 bg-rose-50/40">
        <p className="text-sm text-rose-900">
          <strong>Dívidas ativas</strong> — empréstimo, cartão parcelado, carnê.
          Informe saldo, parcela e dia de vencimento.
        </p>
      </Card>

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl bg-brand-600 py-4 text-center font-semibold text-white shadow-md shadow-brand-600/20"
      >
        + Adicionar dívida
      </button>

      <Card>
        {debts.length === 0 ? (
          <p className="py-8 text-center text-slate-500">Nenhuma dívida cadastrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {debts.map((debt) => {
              const projection = projectDebtPayoff(debt);
              const payment = findPaymentForTarget(
                payments,
                "debt",
                debt.id,
                referenceMonth
              );
              const isPaid = Boolean(payment);
              return (
                <li
                  key={debt.id}
                  className={`flex gap-3 py-4 first:pt-0 last:pb-0 ${paidRowClass(isPaid)}`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-semibold ${paidTextClass(isPaid)}`}>
                        {debt.name}
                      </p>
                      <Badge tone={debt.active ? "success" : "neutral"}>
                        {debt.active ? "Ativa" : "Inativa"}
                      </Badge>
                      {payment ? <PaidStatusBadge payment={payment} /> : null}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isPaid ? "text-slate-400 line-through" : "text-slate-500"}`}
                    >
                      Deve {formatCurrency(debt.remainingBalance)} · Parcela{" "}
                      {formatCurrency(debt.monthlyPayment)} · Dia {debt.dayOfMonth}
                    </p>
                    {debt.active && projection.estimatedMonths !== null ? (
                      <p className="mt-1 text-sm font-medium text-brand-700">
                        Quita em ~{projection.estimatedMonths} mes(es)
                        {projection.estimatedPayoffDate
                          ? ` · ${projection.estimatedPayoffDate}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    {onRegisterPayment && !isPaid ? (
                      <button
                        type="button"
                        onClick={() => onRegisterPayment(debt.id)}
                        className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                      >
                        Já paguei
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onToggle(debt.id)}
                      className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {debt.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(debt)}
                      className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(debt.id)}
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
