"use client";

import { Card } from "@/components/ui";
import type { AssistantMessage, AssistantSummary } from "@/lib/finance/assistant";

const SEVERITY_STYLES: Record<
  AssistantMessage["severity"],
  { dot: string; text: string }
> = {
  urgent: { dot: "bg-rose-500", text: "text-rose-900" },
  warning: { dot: "bg-amber-500", text: "text-amber-950" },
  info: { dot: "bg-brand-500", text: "text-slate-800" },
  success: { dot: "bg-emerald-500", text: "text-emerald-900" },
};

export function AssistantCard({
  summary,
  onAction,
}: {
  summary: AssistantSummary;
  onAction?: (message: AssistantMessage) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm">
          🤝
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Assistente
          </p>
          <p className="font-semibold text-slate-900">{summary.headline}</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {summary.messages.map((message) => {
          const style = SEVERITY_STYLES[message.severity];
          return (
            <li key={message.id} className="flex gap-2.5">
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${style.text}`}>{message.text}</p>
                {message.action && message.actionLabel && onAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(message)}
                    className="mt-1.5 text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    {message.actionLabel}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
