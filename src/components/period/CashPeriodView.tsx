"use client";

import { CycleTimelineCard } from "@/components/movements/MovementsList";
import { paidTextClass } from "@/components/movements/PaidStatus";
import { Badge, Card, Stat } from "@/components/ui";
import type { CalendarMonth, CashPeriodSummary } from "@/lib/finance/cash-period";
import { formatCurrency } from "@/lib/finance/utils";

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  const labels = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${Number(day)} ${labels[Number(month) - 1]}`;
}

function eventKindLabel(kind: CashPeriodSummary["periodEvents"][number]["kind"]): string {
  switch (kind) {
    case "income":
      return "Entrada";
    case "debt":
      return "Dívida";
    case "card-due":
      return "Fatura";
    case "logged":
      return "Gasto lançado";
    case "extra-income":
      return "Ganho extra";
    case "registered-payment":
      return "Pagamento";
    default:
      return "Saída";
  }
}

export function CashPeriodCard({ period }: { period: CashPeriodSummary }) {
  if (!period.hasIncomes) {
    return (
      <Card title="Até a próxima entrada">
        <p className="text-sm text-slate-600">
          Cadastre seus recebimentos em{" "}
          <span className="font-medium text-brand-700">Fixos → Receitas</span>{" "}
          com dia e valor estimado para ver quanto pode gastar até a próxima entrada.
        </p>
      </Card>
    );
  }

  if (!period.nextIncome) {
    return (
      <Card title="Até a próxima entrada">
        <p className="text-sm text-slate-600">
          Não encontramos uma próxima entrada nos próximos meses. Verifique os dias dos
          recebimentos cadastrados.
        </p>
      </Card>
    );
  }

  const positive = period.availableToSpend >= 0;
  const balancePositive = (period.currentAccountBalance ?? 0) >= 0;

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 p-0 text-white shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-300">Hoje · {period.referenceDayLabel}</p>
            <h2 className="mt-1 text-lg font-semibold">
              {period.usesAccountBalance ? "Saldo em conta" : "Até a próxima entrada"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {formatShortDate(period.periodStartDate)} →{" "}
              {formatShortDate(period.periodEndDate)} · {period.periodDays} dia(s)
            </p>
          </div>
          <Badge tone="success">
            Dia {period.nextIncome.dayOfMonth}
          </Badge>
        </div>

        {period.usesAccountBalance && period.currentAccountBalance !== null ? (
          <div className="mt-4 rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-slate-300">Saldo em conta agora</p>
            <p
              className={`mt-1 text-4xl font-bold ${
                balancePositive ? "text-white" : "text-rose-300"
              }`}
            >
              {formatCurrency(period.currentAccountBalance)}
            </p>
            {period.accountBalanceSnapshot ? (
              <p className="mt-1 text-sm text-slate-300">
                Conferido em {formatShortDate(period.accountBalanceSnapshot.asOfDate)}
                {period.balanceMovementsSinceSnapshot?.netChange ? (
                  <>
                    {" "}
                    · ajuste{" "}
                    {period.balanceMovementsSinceSnapshot.netChange >= 0 ? "+" : "−"}
                    {formatCurrency(Math.abs(period.balanceMovementsSinceSnapshot.netChange))}
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Próximo recebimento</p>
          <p className="mt-1 text-xl font-bold">
            {period.nextIncome.name} · {formatCurrency(period.nextIncome.amount)}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            em {formatShortDate(period.nextIncome.date)}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-300">
            {period.usesAccountBalance
              ? "Disponível para gastar (após contas agendadas)"
              : "Disponível para gastar agora"}
          </p>
          <p
            className={`mt-1 text-4xl font-bold ${
              positive ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {formatCurrency(period.availableToSpend)}
          </p>
          {period.dailyBudget !== null ? (
            <p className="mt-1 text-sm text-slate-300">
              ≈ {formatCurrency(period.dailyBudget)} por dia
            </p>
          ) : null}
        </div>

        {period.incomeDayProjection ? (
          <div className="mt-4 space-y-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-200">
            <p>
              Dia {formatShortDate(period.incomeDayProjection.incomeDate)}: entra{" "}
              <span className="font-semibold text-emerald-300">
                {formatCurrency(period.incomeDayProjection.incomeAmount)}
              </span>{" "}
              <span className="text-slate-300">({period.incomeDayProjection.incomeName})</span>
            </p>
            {period.incomeDayProjection.unpaidBillsTotal > 0 ? (
              <>
                <p>
                  Contas fixas a pagar até lá:{" "}
                  <span className="font-semibold text-rose-200">
                    −{formatCurrency(period.incomeDayProjection.unpaidBillsTotal)}
                  </span>
                </p>
                <ul className="space-y-1 text-xs text-slate-400">
                  {period.incomeDayProjection.unpaidBills.map((bill) => (
                    <li key={`${bill.date}-${bill.label}`}>
                      {formatShortDate(bill.date)} · {bill.label} ·{" "}
                      {formatCurrency(bill.amount)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-slate-400">Nenhuma conta fixa pendente até lá.</p>
            )}
            <p className="pt-1 font-medium text-white">
              Depois de pagar, sobra{" "}
              <span
                className={
                  period.incomeDayProjection.remainingAfterIncomeAndBills >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                }
              >
                {formatCurrency(period.incomeDayProjection.remainingAfterIncomeAndBills)}
              </span>
            </p>
          </div>
        ) : period.availableAfterNextIncome !== null ? (
          <p className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-200">
            Quando entrar{" "}
            <span className="font-medium text-white">
              {period.nextIncome.name} ({formatShortDate(period.nextIncome.date)})
            </span>
            , o disponível sobe para{" "}
            <span className="font-semibold text-white">
              {formatCurrency(period.availableAfterNextIncome)}
            </span>
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10">
        {period.usesAccountBalance ? (
          <>
            <div className="bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Ganhos desde conferência</p>
              <p className="mt-1 font-semibold text-emerald-300">
                +{formatCurrency(period.balanceMovementsSinceSnapshot?.extraIncomes ?? 0)}
              </p>
            </div>
            <div className="bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Saídas desde conferência</p>
              <p className="mt-1 font-semibold text-rose-200">
                −
                {formatCurrency(
                  (period.balanceMovementsSinceSnapshot?.registeredPayments ?? 0) +
                    (period.balanceMovementsSinceSnapshot?.loggedExpenses ?? 0)
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Já entrou no ciclo</p>
              <p className="mt-1 font-semibold">{formatCurrency(period.incomeReceived)}</p>
              {period.extraIncomePast > 0 ? (
                <p className="mt-1 text-xs text-emerald-300">
                  + {formatCurrency(period.extraIncomePast)} extras
                </p>
              ) : null}
            </div>
            <div className="bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Já saiu (pagamentos)</p>
              <p className="mt-1 font-semibold text-rose-200">
                −{formatCurrency(period.expensesAlreadyPaid)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Só desconta quando você registra o pagamento
              </p>
            </div>
          </>
        )}
        <div className="bg-slate-900/40 p-4">
          <p className="text-xs text-slate-400">Ainda vai sair (agendado)</p>
          <p className="mt-1 font-semibold text-rose-200">
            −{formatCurrency(period.expensesUpcoming)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Contas com vencimento futuro no período
          </p>
        </div>
        <div className="bg-slate-900/40 p-4">
          <p className="text-xs text-slate-400">Variáveis (período)</p>
          <p className="mt-1 font-semibold text-amber-200">
            −{formatCurrency(period.variableBudgetForPeriod)}
          </p>
        </div>
        {period.loggedExpensesTotal > 0 ? (
          <div className="col-span-2 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">Gastos lançados (período)</p>
            <p className="mt-1 font-semibold text-violet-200">
              −{formatCurrency(period.loggedExpensesTotal)}
            </p>
            {period.loggedExpensesUpcoming > 0 ? (
              <p className="mt-1 text-xs text-slate-400">
                Inclui {formatCurrency(period.loggedExpensesUpcoming)} planejados
              </p>
            ) : null}
          </div>
        ) : null}
        {period.registeredPaymentsPast > 0 ? (
          <div className="col-span-2 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">Pagamentos registrados (ciclo)</p>
            <p className="mt-1 font-semibold text-rose-200">
              −{formatCurrency(period.registeredPaymentsPast)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Já incluídos em &quot;Já saiu&quot; — data real do pagamento
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function PeriodEventsList({ period }: { period: CashPeriodSummary }) {
  if (!period.nextIncome || period.periodEvents.length === 0) {
    return null;
  }

  return (
    <Card title="Movimentos até a próxima entrada">
      <ul className="space-y-3">
        {period.periodEvents.map((event) => {
          const isPaid = event.kind === "registered-payment";
          return (
          <li
            key={event.id}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
              isPaid ? "border border-emerald-100 bg-emerald-50/60" : "bg-slate-50"
            }`}
          >
            <div>
              <p className={`font-medium ${isPaid ? paidTextClass(false) : "text-slate-900"}`}>
                {event.name}
              </p>
              <p className="text-sm text-slate-500">
                Dia {event.day} · {eventKindLabel(event.kind)}
              </p>
            </div>
            <div className="text-right">
              {isPaid ? (
                <Badge tone="success">Já pago</Badge>
              ) : null}
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

export function MonthCalendarView({ calendar }: { calendar: CalendarMonth }) {
  return (
    <Card title={`Calendário · ${calendar.label}`}>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Recebimento
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Saída
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700">
            período
          </span>
          Até próxima entrada
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {calendar.weekDayHeaders.map((label, index) => (
          <div key={`${label}-${index}`} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendar.days.map((cell, index) => {
          if (cell.day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          return (
            <div
              key={cell.date}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                cell.isToday
                  ? "bg-brand-600 font-bold text-white ring-2 ring-brand-300"
                  : cell.isInPeriod
                    ? "bg-brand-50 font-semibold text-brand-800"
                    : "bg-slate-50 text-slate-700"
              }`}
            >
              <span>{cell.day}</span>
              <div className="mt-0.5 flex gap-0.5">
                {cell.isIncomeDay ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                ) : null}
                {cell.hasExpense ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function CashPeriodDetails({
  period,
  calendar,
}: {
  period: CashPeriodSummary;
  calendar: CalendarMonth;
}) {
  return (
    <div className="space-y-4">
      <CashPeriodCard period={period} />
      {period.lastIncome ? (
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Último recebimento"
            value={period.lastIncome.amount}
            tone="positive"
          />
          <Stat
            label="Variáveis / mês"
            value={period.totalVariableMonthly}
            tone="negative"
          />
        </div>
      ) : null}
      <MonthCalendarView calendar={calendar} />
      <CycleTimelineCard period={period} />
      <PeriodEventsList period={period} />
    </div>
  );
}
