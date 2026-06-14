"use client";

import { Badge, Card } from "@/components/ui";
import { getGoalProgressPercent } from "@/lib/finance/goal-form";
import type { FinancialGoal, GoalProjection } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/finance/utils";

function GoalProjectionCard({ item }: { item: GoalProjection }) {
  const progress = getGoalProgressPercent(
    item.goal.targetAmount,
    item.goal.currentSaved
  );

  return (
    <li className="rounded-2xl border border-slate-100 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{item.goal.name}</p>
          <p className="text-sm text-slate-500">
            Meta {formatCurrency(item.goal.targetAmount)} · Guardado{" "}
            {formatCurrency(item.goal.currentSaved)}
          </p>
        </div>
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
            : item.estimatedMonths === 0
              ? "Concluída"
              : `${item.estimatedMonths} mes(es)`}
        </Badge>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">{progress}% da meta</p>

      <p className="mt-3 text-sm text-slate-600">
        Faltam {formatCurrency(item.remaining)} · Sobra/mês:{" "}
        {formatCurrency(item.monthlySurplus)}
      </p>

      {item.estimatedDate ? (
        <p className="mt-1 text-sm font-medium text-brand-700">
          Previsão: {item.estimatedDate}
        </p>
      ) : null}

      {item.goal.targetDate && item.onTrack === false ? (
        <p className="mt-1 text-sm text-amber-700">
          Atrasada em relação à data desejada ({item.goal.targetDate})
        </p>
      ) : null}

      {item.suggestions.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {item.suggestions.map((s) => (
            <li key={s.id} className="text-xs text-slate-600">
              {s.label} →{" "}
              {s.newEstimatedMonths !== null
                ? `${s.newEstimatedMonths} mes(es)`
                : "—"}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function GoalsScreen({
  allGoals,
  projections,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  allGoals: FinancialGoal[];
  projections: GoalProjection[];
  onAdd: () => void;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const activeIds = new Set(projections.map((p) => p.goal.id));
  const inactive = allGoals.filter((g) => !g.active);

  return (
    <div className="space-y-4">
      <Card className="border-brand-100 bg-brand-50/40">
        <p className="text-sm text-brand-900">
          Com base na <strong>sobra mensal</strong> do Início, calculamos quanto
          tempo falta para cada meta e sugerimos ajustes.
        </p>
      </Card>

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl bg-brand-600 py-4 text-center font-semibold text-white shadow-md shadow-brand-600/20"
      >
        + Adicionar meta
      </button>

      <Card>
        {projections.length === 0 ? (
          <p className="py-8 text-center text-slate-500">Nenhuma meta ativa.</p>
        ) : (
          <ul className="space-y-4">
            {projections.map((item) => (
              <div key={item.goal.id}>
                <GoalProjectionCard item={item} />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(item.goal.id)}
                    className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Desativar
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item.goal)}
                    className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.goal.id)}
                    className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </ul>
        )}
      </Card>

      {inactive.length > 0 ? (
        <Card title="Metas inativas">
          <ul className="space-y-3">
            {inactive.map((goal) => (
              <li
                key={goal.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-sm text-slate-700">{goal.name}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(goal.id)}
                    className="text-xs font-medium text-brand-700"
                  >
                    Ativar
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(goal)}
                    className="text-xs font-medium text-slate-600"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(goal.id)}
                    className="text-xs font-medium text-rose-600"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
