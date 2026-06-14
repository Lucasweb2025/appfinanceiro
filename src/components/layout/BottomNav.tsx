"use client";

import type { EntryType } from "@/lib/finance/types";

export type AppTab =
  | "home"
  | "recurring"
  | "variable"
  | "debts"
  | "cards"
  | "goals"
  | "settings";

const tabs: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: "home", label: "Início", icon: "⌂" },
  { id: "recurring", label: "Fixos", icon: "📅" },
  { id: "variable", label: "Variáveis", icon: "≋" },
  { id: "debts", label: "Dívidas", icon: "📋" },
  { id: "cards", label: "Cartões", icon: "💳" },
  { id: "goals", label: "Metas", icon: "🎯" },
  { id: "settings", label: "Config.", icon: "⚙" },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium transition sm:text-[10px] ${
                selected ? "text-brand-700" : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                  selected ? "bg-brand-100" : ""
                }`}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function EntryTypeTabs({
  value,
  onChange,
}: {
  value: EntryType | "all";
  onChange: (value: EntryType | "all") => void;
}) {
  const options: Array<{ value: EntryType | "all"; label: string }> = [
    { value: "all", label: "Todos" },
    { value: "income", label: "Receitas" },
    { value: "expense", label: "Despesas" },
  ];

  return (
    <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
            value === option.value
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-600"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
