"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { todayParts, toISODate } from "@/lib/finance/utils";

const STORAGE_KEY = "app-financas-bank-reminder-dismissed";

export function BankSyncReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = todayParts();
    const todayIso = toISODate(today.year, today.month, today.day);
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    setVisible(dismissed !== todayIso);
  }, []);

  function dismiss() {
    const today = todayParts();
    const todayIso = toISODate(today.year, today.month, today.day);
    window.localStorage.setItem(STORAGE_KEY, todayIso);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Card className="border border-brand-200 bg-brand-50">
      <p className="font-semibold text-brand-900">Lançou tudo do banco hoje?</p>
      <p className="mt-2 text-sm text-brand-800">
        Confira o extrato e registre aqui: gastos do dia (+ Gasto), contas pagas (+
        Pagamento) e entradas (+ Ganho).
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 w-full rounded-2xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
      >
        Ok, lancei tudo
      </button>
    </Card>
  );
}

export function BankBalanceSetupHint() {
  return (
    <Card className="border border-amber-200 bg-amber-50">
      <p className="font-semibold text-amber-900">Use o saldo real do banco</p>
      <p className="mt-2 text-sm text-amber-800">
        Em <strong>Config.</strong>, informe quanto tem na conta. Depois lance aqui tudo
        que sair ou entrar do banco.
      </p>
    </Card>
  );
}
