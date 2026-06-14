"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import {
  validateAccountBalance,
  type AccountBalanceFormData,
} from "@/lib/finance/account-balance";
import type { AccountBalanceSnapshot } from "@/lib/finance/types";
import type { AssistantTone } from "@/lib/finance/assistant-tone";
import { formatCurrency, todayParts, toISODate } from "@/lib/finance/utils";

export function SettingsView({
  snapshot,
  assistantTone,
  onAssistantToneChange,
  onSaveSnapshot,
  onClearSnapshot,
  onRestoreDefaults,
  onClearAll,
}: {
  snapshot: AccountBalanceSnapshot | null;
  assistantTone: AssistantTone;
  onAssistantToneChange: (tone: AssistantTone) => void;
  onSaveSnapshot: (data: AccountBalanceFormData) => void;
  onClearSnapshot: () => void;
  onRestoreDefaults: () => void;
  onClearAll: () => void;
}) {
  const today = todayParts();
  const [form, setForm] = useState<AccountBalanceFormData>({
    amount: snapshot?.amount ?? 0,
    asOfDate: snapshot?.asOfDate ?? toISODate(today.year, today.month, today.day),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AccountBalanceFormData, string>>>(
    {}
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      amount: snapshot?.amount ?? 0,
      asOfDate:
        snapshot?.asOfDate ?? toISODate(today.year, today.month, today.day),
    });
  }, [snapshot]);

  function handleClearAll() {
    const confirmed = window.confirm(
      "Apagar todos os dados do app? Esta ação não pode ser desfeita."
    );
    if (confirmed) onClearAll();
  }

  function handleRestoreDefaults() {
    const confirmed = window.confirm(
      "Restaurar o perfil padrão (seus fixos, Nubank, saldo R$ 2)?"
    );
    if (confirmed) onRestoreDefaults();
  }

  function handleSaveBalance(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateAccountBalance(form);
    if (validation.length > 0) {
      setErrors(Object.fromEntries(validation.map((item) => [item.field, item.message])));
      setSaved(false);
      return;
    }

    setErrors({});
    onSaveSnapshot(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleClearBalance() {
    const confirmed = window.confirm(
      "Parar de usar saldo em conta e voltar ao cálculo por recebimentos?"
    );
    if (confirmed) onClearSnapshot();
  }

  return (
    <div className="space-y-4">
      <Card title="Tom do assistente">
        <p className="mb-4 text-sm text-slate-600">
          Escolha como o resumo e o simulador falam com você.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAssistantToneChange("direct")}
            className={`rounded-2xl py-3 text-sm font-semibold ${
              assistantTone === "direct"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Direto
          </button>
          <button
            type="button"
            onClick={() => onAssistantToneChange("gentle")}
            className={`rounded-2xl py-3 text-sm font-semibold ${
              assistantTone === "gentle"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Leve
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {assistantTone === "direct"
            ? "Ex.: “Segura o gasto”, “Marca como pago”."
            : "Ex.: “Vale conferir”, “Fique de olho”."}
        </p>
      </Card>

      <Card title="Saldo em conta">
        <p className="mb-4 text-sm text-slate-600">
          Informe o valor que aparece no app do seu banco agora — já com tudo que
          saiu ou entrou até esse momento. &quot;Já paguei&quot; no mês não
          desconta de novo desse valor. Só movimentos{" "}
          <strong>depois</strong> da data da conferência ajustam o saldo.
        </p>

        {snapshot ? (
          <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Saldo atual estimado:{" "}
            <strong>{formatCurrency(snapshot.amount)}</strong> conferido em{" "}
            {formatShortDate(snapshot.asOfDate)}. Veja o valor atualizado no Início.
          </p>
        ) : null}

        <form onSubmit={handleSaveBalance} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Valor na conta
            </label>
            <input
              data-testid="account-balance-amount"
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={form.amount || ""}
              onChange={(event) =>
                setForm({ ...form, amount: Number(event.target.value) })
              }
              placeholder="Ex.: 2450,00"
            />
            {errors.amount ? (
              <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Conferido em
            </label>
            <input
              data-testid="account-balance-date"
              type="date"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={form.asOfDate}
              onChange={(event) =>
                setForm({ ...form, asOfDate: event.target.value })
              }
            />
            {errors.asOfDate ? (
              <p className="mt-1 text-sm text-rose-600">{errors.asOfDate}</p>
            ) : null}
          </div>

          <button
            data-testid="save-account-balance"
            type="submit"
            className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white"
          >
            {snapshot ? "Atualizar saldo" : "Salvar saldo em conta"}
          </button>

          {saved ? (
            <p className="text-center text-sm font-medium text-emerald-600">
              Saldo salvo. Confira no Início.
            </p>
          ) : null}
        </form>

        {snapshot ? (
          <button
            type="button"
            onClick={handleClearBalance}
            className="mt-3 w-full rounded-2xl bg-slate-100 py-3 text-sm font-medium text-slate-700"
          >
            Usar só recebimentos (sem saldo manual)
          </button>
        ) : null}
      </Card>

      <Card title="Dados">
        <p className="mb-4 text-sm text-slate-600">
          Seus lançamentos ficam salvos neste navegador.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="w-full rounded-2xl bg-brand-50 py-3 font-medium text-brand-700"
          >
            Restaurar dados de exemplo
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full rounded-2xl bg-rose-50 py-3 font-medium text-rose-700"
          >
            Apagar todos os lançamentos
          </button>
        </div>
      </Card>

      <Card title="Sobre">
        <p className="text-sm text-slate-600">
          <strong>App Finanças</strong> — controle de receitas fixas, despesas fixas
          e despesas variáveis.
        </p>
        <p className="mt-2 text-sm text-slate-500">Versão 0.1.0</p>
      </Card>

      <Card title="Ajuda">
        <p className="text-sm text-slate-600">
          Se aparecer um ícone estranho em inglês no canto da tela, é a ferramenta
          de desenvolvimento do Next.js — não faz parte do app. Foi desativado
          para não atrapalhar.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Fixos</strong>, <strong>Variáveis</strong>, <strong>Dívidas</strong>,{" "}
          <strong>Cartões</strong>, <strong>Metas</strong> e <strong>Início</strong>.
        </p>
      </Card>
    </div>
  );
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)}/${Number(month)}`;
}
