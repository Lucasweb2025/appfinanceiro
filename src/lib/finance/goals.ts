import type {
  FinancialGoal,
  GoalProjection,
  GoalSuggestion,
} from "./types";
import {
  addMonthsToDate,
  monthsBetween,
  roundMoney,
  todayParts,
} from "./utils";
import { getMonthlySurplus } from "./projection";
import type { ProjectionInput } from "./types";

function estimateCompletion(
  remaining: number,
  monthlySurplus: number
): { months: number | null; date: string | null } {
  if (remaining <= 0) {
    const { year, month, day } = todayParts();
    return { months: 0, date: addMonthsToDate(year, month, day, 0) };
  }

  if (monthlySurplus <= 0) {
    return { months: null, date: null };
  }

  const monthsNeeded = Math.ceil(remaining / monthlySurplus);
  const { year, month, day } = todayParts();
  return {
    months: monthsNeeded,
    date: addMonthsToDate(year, month, day, monthsNeeded),
  };
}

function buildSuggestions(
  remaining: number,
  monthlySurplus: number
): GoalSuggestion[] {
  if (remaining <= 0 || monthlySurplus <= 0) {
    return [];
  }

  const increments = [50, 100, 200];
  return increments.map((extra) => {
    const newSurplus = roundMoney(monthlySurplus + extra);
    const estimate = estimateCompletion(remaining, newSurplus);
    return {
      id: `save-${extra}`,
      label: `Guardar mais ${extra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`,
      extraMonthlySavings: extra,
      newEstimatedMonths: estimate.months,
      newEstimatedDate: estimate.date,
    };
  });
}

function compareWithTargetDate(
  goal: FinancialGoal,
  estimatedDate: string | null
): { onTrack: boolean | null; monthsAheadOrBehind: number | null } {
  if (!goal.targetDate || !estimatedDate) {
    return { onTrack: null, monthsAheadOrBehind: null };
  }

  const [targetYear, targetMonth] = goal.targetDate.split("-").map(Number);
  const [estYear, estMonth] = estimatedDate.split("-").map(Number);
  const diff = monthsBetween(estYear, estMonth, targetYear, targetMonth);

  return {
    onTrack: diff >= 0,
    monthsAheadOrBehind: -diff,
  };
}

/** Calcula meta usando a sobra mensal do dashboard */
export function projectGoalWithSurplus(
  goal: FinancialGoal,
  monthlySurplus: number
): GoalProjection {
  const remaining = roundMoney(
    Math.max(goal.targetAmount - goal.currentSaved, 0)
  );
  const estimate = estimateCompletion(remaining, monthlySurplus);
  const track = compareWithTargetDate(goal, estimate.date);

  return {
    goal,
    remaining,
    monthlySurplus,
    estimatedMonths: estimate.months,
    estimatedDate: estimate.date,
    onTrack: track.onTrack,
    monthsAheadOrBehind: track.monthsAheadOrBehind,
    suggestions: buildSuggestions(remaining, monthlySurplus),
  };
}

export function projectGoalsWithSurplus(
  goals: FinancialGoal[],
  monthlySurplus: number
): GoalProjection[] {
  return goals
    .filter((goal) => goal.active)
    .map((goal) => projectGoalWithSurplus(goal, monthlySurplus));
}

/**
 * Calcula quanto tempo falta para a meta (via projeção completa).
 */
export function projectGoal(
  goal: FinancialGoal,
  projectionInput: ProjectionInput
): GoalProjection {
  return projectGoalWithSurplus(goal, getMonthlySurplus(projectionInput));
}

export function projectGoals(
  goals: FinancialGoal[],
  projectionInput: ProjectionInput
): GoalProjection[] {
  return projectGoalsWithSurplus(goals, getMonthlySurplus(projectionInput));
}
