"use client";

import { PaidStatusBadge, paidTextClass } from "@/components/movements/PaidStatus";
import { Badge, Card } from "@/components/ui";
import { EntryTypeTabs } from "@/components/layout/BottomNav";
import type { EntryType, RecurringEntry, RegisteredPayment } from "@/lib/finance/types";
import { findPaymentForTarget } from "@/lib/finance/registered-payment";
import { formatCurrency, todayParts } from "@/lib/finance/utils";

export function RecurringList({
  entries,
  payments,
  filter,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onRegisterPayment,
}: {
  entries: RecurringEntry[];
  payments: RegisteredPayment[];
  filter: EntryType | "all";
  onFilterChange: (value: EntryType | "all") => void;
  onAdd: () => void;
  onEdit: (entry: RecurringEntry) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onRegisterPayment?: (entryId: string) => void;
}) {
  const today = todayParts();
  const referenceMonth = `${today.year}-${String(today.month).padStart(2, "0")}`;
  const filtered =
    filter === "all" ? entries : entries.filter((entry) => entry.type === filter);

  return (
    <div className="space-y-4">
      <EntryTypeTabs value={filter} onChange={onFilterChange} />

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl bg-brand-600 py-4 text-center font-semibold text-white shadow-md shadow-brand-600/20"
      >
        {filter === "income"
          ? "+ Adicionar recebimento"
          : filter === "expense"
            ? "+ Adicionar despesa fixa"
            : "+ Adicionar lançamento"}
      </button>

      {filter === "income" ? (
        <Card className="border-brand-100 bg-brand-50/40">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-brand-800">Recebimentos</span> — informe
            os dias que você recebe e o valor estimado. O calendário e o card
            &quot;Até a próxima entrada&quot; usam esses dados.
          </p>
        </Card>
      ) : filter === "expense" ? (
        <Card className="border-rose-100 bg-rose-50/40">
          <p className="text-sm text-rose-900">
            <span className="font-semibold">Despesas fixas</span> — aluguel, internet,
            etc. Quando pagar no banco, toque em <strong>Já paguei</strong>.
          </p>
        </Card>
      ) : null}

      <Card>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            Nenhum lançamento nesta categoria.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((entry) => {
              const payment =
                entry.type === "expense"
                  ? findPaymentForTarget(
                      payments,
                      "recurring",
                      entry.id,
                      referenceMonth
                    )
                  : undefined;
              const isPaid = Boolean(payment);

              return (
                <li key={entry.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`font-semibold ${isPaid ? paidTextClass(true) : "text-slate-900"}`}
                      >
                        {entry.name}
                      </p>
                      <Badge tone={entry.active ? "success" : "neutral"}>
                        {entry.active ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge tone={entry.type === "income" ? "success" : "danger"}>
                        {entry.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                      {payment ? <PaidStatusBadge payment={payment} /> : null}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isPaid ? "text-slate-400 line-through" : "text-slate-500"}`}
                    >
                      Dia {entry.dayOfMonth} · {formatCurrency(entry.defaultAmount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {onRegisterPayment && entry.type === "expense" && entry.active && !isPaid ? (
                      <button
                        type="button"
                        onClick={() => onRegisterPayment(entry.id)}
                        className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                      >
                        Já paguei
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onToggle(entry.id)}
                      className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {entry.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
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
