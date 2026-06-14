"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

export function LoginView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const message =
      mode === "login"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    setLoading(false);

    if (message) {
      setError(message);
      return;
    }

    if (mode === "signup") {
      setInfo("Conta criada. Confira seu e-mail se a confirmação estiver ativa no Supabase.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-brand-700">App Finanças</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Entre para sincronizar
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Seus lançamentos ficam salvos na nuvem e disponíveis em outro
            aparelho.
          </p>
        </div>

        <Card title={mode === "login" ? "Entrar" : "Criar conta"}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                E-mail
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Senha
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <p className="text-sm text-rose-600">{error}</p>
            ) : null}
            {info ? <p className="text-sm text-emerald-600">{info}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 w-full text-sm font-medium text-brand-700"
          >
            {mode === "login"
              ? "Não tem conta? Criar agora"
              : "Já tem conta? Entrar"}
          </button>
        </Card>
      </div>
    </main>
  );
}
