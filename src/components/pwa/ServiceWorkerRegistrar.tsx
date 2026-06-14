"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/app-base-path";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register(withBasePath("/sw.js"), {
          scope: withBasePath("/"),
        });
      } catch {
        // Falha silenciosa — app continua online
      }
    };

    void register();
  }, []);

  return null;
}
