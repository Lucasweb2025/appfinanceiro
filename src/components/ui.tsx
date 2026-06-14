import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/finance/utils";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-600">App Finanças</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-brand-700"
      : tone === "negative"
        ? "text-rose-600"
        : "text-slate-900";

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const classes = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
  }[tone];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {children}
    </span>
  );
}
