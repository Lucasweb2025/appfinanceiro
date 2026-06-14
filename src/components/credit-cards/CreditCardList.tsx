"use client";

import { PaidStatusBadge, paidRowClass, paidTextClass } from "@/components/movements/PaidStatus";
import { Badge, Card } from "@/components/ui";
import type { CreditCard, RegisteredPayment } from "@/lib/finance/types";
import { findPaymentForTarget } from "@/lib/finance/registered-payment";
import { formatCurrency, todayParts } from "@/lib/finance/utils";

export function CreditCardList({
  cards,
  payments,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onRegisterPayment,
}: {
  cards: CreditCard[];
  payments: RegisteredPayment[];
  onAdd: () => void;  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onRegisterPayment?: (cardId: string) => void;
}) {
  const today = todayParts();
  const referenceMonth = `${today.year}-${String(today.month).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <Card className="border-violet-100 bg-violet-50/50">
        <p className="text-sm text-violet-900">
          <strong>Cartão de crédito</strong> — informe o dia de{" "}
          <strong>fechamento</strong> (fatura fecha) e <strong>vencimento</strong>{" "}
          (pagamento). O dashboard projeta a fatura no dia certo.
        </p>
      </Card>

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl bg-brand-600 py-4 text-center font-semibold text-white shadow-md shadow-brand-600/20"
      >
        + Adicionar cartão
      </button>

      <Card>
        {cards.length === 0 ? (
          <p className="py-8 text-center text-slate-500">Nenhum cartão cadastrado.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {cards.map((card) => {
              const payment = findPaymentForTarget(
                payments,
                "card",
                card.id,
                referenceMonth
              );
              const isPaid = Boolean(payment);
              return (
              <li
                key={card.id}
                className={`flex gap-3 py-4 first:pt-0 last:pb-0 ${paidRowClass(isPaid)}`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold ${paidTextClass(isPaid)}`}>{card.name}</p>
                    <Badge tone={card.active ? "success" : "neutral"}>
                      {card.active ? "Ativo" : "Inativo"}
                    </Badge>
                    {payment ? <PaidStatusBadge payment={payment} /> : null}
                  </div>
                  <p className={`mt-1 text-sm ${isPaid ? "text-slate-400 line-through" : "text-slate-500"}`}>
                    Fecha dia {card.closingDay} · Vence dia {card.dueDay}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${isPaid ? "text-slate-400 line-through" : "text-slate-700"}`}
                  >
                    Fatura est.: {formatCurrency(card.estimatedBillAmount)}
                    {card.creditLimit
                      ? ` · Limite ${formatCurrency(card.creditLimit)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {onRegisterPayment && !isPaid ? (
                    <button
                      type="button"
                      onClick={() => onRegisterPayment(card.id)}
                      className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      Já paguei
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggle(card.id)}
                    className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {card.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(card.id)}
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
