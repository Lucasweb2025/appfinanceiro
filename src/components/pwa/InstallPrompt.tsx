"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { isStandaloneDisplay } from "@/lib/notifications/alerts";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandaloneDisplay()) return;

    const dismissed = sessionStorage.getItem("app-financas-install-dismissed");
    if (dismissed) return;

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <Card title="Instalar no celular">
      <p className="mb-4 text-sm text-slate-600">
        Adicione à tela inicial para abrir como app, com ícone e tela cheia.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            setHidden(true);
            setDeferred(null);
          }}
          className="flex-1 rounded-2xl bg-brand-600 py-3 font-semibold text-white"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("app-financas-install-dismissed", "1");
            setHidden(true);
          }}
          className="flex-1 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700"
        >
          Agora não
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        iPhone: Safari → Compartilhar → Adicionar à Tela de Início.
      </p>
    </Card>
  );
}
