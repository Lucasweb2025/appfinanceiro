"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { AuthProvider } from "@/hooks/useAuth";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ServiceWorkerRegistrar />
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
