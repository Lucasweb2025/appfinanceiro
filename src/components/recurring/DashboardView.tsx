"use client";

import { BankBalanceSetupHint, BankSyncReminder } from "@/components/home/BankSyncReminder";
import { CashPeriodDetails } from "@/components/period/CashPeriodView";
import { MovementsListCard } from "@/components/movements/MovementsList";
import { paidTextClass } from "@/components/movements/PaidStatus";
import { Badge, Card, Stat } from "@/components/ui";
import type { DashboardSummary } from "@/lib/finance/dashboard";
import { formatPaidDateLabel } from "@/lib/finance/registered-payment";
import type { AdHocIncome, RegisteredPayment } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/finance/utils";

export function DashboardView({
  summary,
  onAddExpense,
  onAddIncome,
  onRegisterPayment,
  incomes,
  payments,
  onEditIncome,
  onDeleteIncome,
  onEditPayment,
  onDeletePayment,
}: {
  summary: DashboardSummary;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onRegisterPayment: (presetKey?: string) => void;
  incomes: AdHocIncome[];
  payments: RegisteredPayment[];
  onEditIncome: (income: AdHocIncome) => void;
  onDeleteIncome: (id: string) => void;
  onEditPayment: (payment: RegisteredPayment) => void;
  onDeletePayment: (id: string) => void;
}) {
  const positive = summary.netBalance >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onAddExpense}
          className="rounded-2xl bg-violet-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-600/20"
        >
          + Gasto
        </button>
        <button
          type="button"
          onClick={onAddIncome}
          className="rounded-2xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-emerald-600/20"
        >
          + Ganho
        </button>
        <button
          type="button"
          onClick={() => onRegisterPayment()}
          className="rounded-2xl bg-rose-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-rose-600/20"
        >
          + Pagamento
        </button>
      </div>

      {summary.cashPeriod.usesAccountBalance ? (
        <BankSyncReminder />
      ) : (
        <BankBalanceSetupHint />
      )}

      <CashPeriodDetails
        period={summary.cashPeriod}
        calendar={summary.calendar}
      />

      <MovementsListCard
        incomes={incomes}
        payments={payments}
        onEditIncome={onEditIncome}
        onDeleteIncome={onDeleteIncome}
        onEditPayment={onEditPayment}
        onDeletePayment={onDeletePayment}
      />

      <Card
        className={`border-0 text-white shadow-lg ${
          positive
            ? "bg-gradient-to-br from-brand-600 to-brand-700 shadow-brand-600/20"
            : "bg-gradient-to-br from-rose-600 to-rose-700 shadow-rose-600/20"
        }`}
      >
        <p className="text-sm opacity-90">Sobra prevista · {summary.label}</p>
        <p className="mt-2 text-4xl font-bold">{formatCurrency(summary.netBalance)}</p>
        <p className="mt-2 text-sm opacity-90">
          Entradas − fixos − variáveis − dívidas − faturas cartão
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Entradas" value={summary.totalIncome} tone="positive" />
        <Stat label="Total saídas" value={summary.totalExpenses} tone="negative" />
        <Stat
          label="Faturas cartão"
          value={summary.totalCreditCardBills}
          tone="negative"
        />
        <Stat
          label="Parcelas dívidas"
          value={summary.totalDebtPayments}
          tone="negative"
        />
      </div>

      {summary.upcomingAlerts.length > 0 ? (
        <Card title="Próximos no mês">
          <ul className="space-y-3">
            {summary.upcomingAlerts.map((alert) => (
              <li
                key={`${alert.date}-${alert.label}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{alert.label}</p>
                  <p className="text-sm text-slate-500">Dia {alert.day}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge
                    tone={
                      alert.kind === "income"
                        ? "success"
                        : alert.kind === "card-closing"
                          ? "neutral"
                          : alert.kind === "card-due"
                            ? "warning"
                            : alert.kind === "debt"
                              ? "warning"
                              : "danger"
                    }
                  >
                    {alert.kind === "income"
                      ? "Entrada"
                      : alert.kind === "debt"
                        ? "Dívida"
                        : alert.kind === "card-closing"
                          ? "Fechamento"
                          : alert.kind === "card-due"
                            ? "Fatura"
                            : "Saída"}
                  </Badge>
                  {alert.kind === "card-closing" ? (
                    <p className="text-sm font-medium text-slate-600">Fecha</p>
                  ) : (
                    <p
                      className={`font-bold ${
                        alert.kind === "income" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {alert.kind === "income" ? "+" : "-"}
                      {formatCurrency(alert.amount)}
                    </p>
                  )}
                  {alert.paymentPresetKey ? (
                    <button
                      type="button"
                      onClick={() => onRegisterPayment(alert.paymentPresetKey)}
                      className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      Já paguei
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.paidAlerts.length > 0 ? (
        <Card title="Já pagos este mês">
          <ul className="space-y-3">
            {summary.paidAlerts.map((alert) => (
              <li
                key={`paid-${alert.date}-${alert.label}`}
                className="flex items-center justify-between rounded-2xl bg-emerald-50/60 px-4 py-3"
              >
                <div>
                  <p className={`font-medium ${paidTextClass(true)}`}>{alert.label}</p>
                  <p className="text-sm text-slate-500">
                    Venc. dia {alert.day}
                    {alert.paidDate
                      ? ` · ${formatPaidDateLabel(alert.paidDate, alert.paidEarly)}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={alert.paidEarly ? "warning" : "success"}>
                    {alert.paidEarly ? "Antecipado" : "Pago"}
                  </Badge>
                  <p className="mt-1 font-bold text-slate-400 line-through">
                    -{formatCurrency(alert.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.variableItems.length > 0 ? (
        <Card title="Despesas variáveis (estimativa)">
          <ul className="space-y-3">
            {summary.variableItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">Estimativa mensal</p>
                </div>
                <p className="font-bold text-rose-600">-{formatCurrency(item.amount)}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.debtItems.length > 0 ? (
        <Card title="Dívidas — previsão de quitação">
          <ul className="space-y-3">
            {summary.debtItems.map((debt) => (
              <li
                key={debt.id}
                className={`rounded-2xl border px-4 py-3 ${
                  debt.isPaidThisMonth
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-slate-100"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-medium ${paidTextClass(debt.isPaidThisMonth)}`}>
                    {debt.name}
                  </p>
                  {debt.isPaidThisMonth && debt.paidDate ? (
                    <Badge tone={debt.paidEarly ? "warning" : "success"}>
                      {debt.paidEarly ? "Pago antecipado" : "Já pago"}
                    </Badge>
                  ) : null}
                </div>
                <p
                  className={`text-sm ${debt.isPaidThisMonth ? "text-slate-400 line-through" : "text-slate-500"}`}
                >
                  Deve {formatCurrency(debt.remaining)} · Parcela{" "}
                  {formatCurrency(debt.monthlyPayment)}
                </p>
                <p className="mt-1 text-sm font-medium text-brand-700">
                  {debt.estimatedMonths === null
                    ? "Sem previsão"
                    : debt.estimatedMonths === 0
                      ? "Quitada"
                      : `Quita em ~${debt.estimatedMonths} mes(es)`}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.goalProjections.length > 0 ? (
        <Card title="Metas — quanto tempo para chegar?">
          <ul className="space-y-4">
            {summary.goalProjections.map((item) => {
              const progress = Math.min(
                100,
                Math.round((item.goal.currentSaved / item.goal.targetAmount) * 100)
              );
              return (
                <li
                  key={item.goal.id}
                  className="rounded-2xl border border-brand-100 bg-brand-50/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900">{item.goal.name}</p>
                    <Badge
                      tone={
                        item.estimatedMonths === null
                          ? "danger"
                          : item.onTrack === false
                            ? "warning"
                            : "success"
                      }
                    >
                      {item.estimatedMonths === null
                        ? "Sem sobra"
                        : `${item.estimatedMonths} mes(es)`}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Faltam {formatCurrency(item.remaining)} · Previsão:{" "}
                    {item.estimatedDate ?? "—"}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {summary.creditCardItems.length > 0 ? (
        <Card title="Cartões — fechamento e vencimento">
          <ul className="space-y-3">
            {summary.creditCardItems.map((card) => (
              <li
                key={card.id}
                className={`rounded-2xl border px-4 py-3 ${
                  card.isPaidThisMonth
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-violet-100 bg-violet-50/40"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-medium ${paidTextClass(Boolean(card.isPaidThisMonth))}`}>
                    {card.name}
                  </p>
                  {card.isPaidThisMonth ? (
                    <Badge tone={card.paidEarly ? "warning" : "success"}>
                      {card.paidEarly ? "Pago antecipado" : "Já pago"}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-500">
                  Fecha dia {card.closingDay} · Vence dia {card.dueDay}
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${card.isPaidThisMonth ? "text-slate-400 line-through" : "text-rose-700"}`}
                >
                  Fatura est.: {formatCurrency(card.estimatedBillAmount)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
