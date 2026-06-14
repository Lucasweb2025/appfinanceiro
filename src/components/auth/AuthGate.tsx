"use client";

import type { ReactNode } from "react";
import { LoginView } from "@/components/auth/LoginView";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { configured, ready, session } = useAuth();

  if (!configured) return children;

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-slate-500">Carregando sessão...</p>
      </main>
    );
  }

  if (!session) return <LoginView />;

  return children;
}
