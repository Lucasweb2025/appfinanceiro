"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { pullFinanceData, pushFinanceData } from "@/lib/supabase/sync";

interface AuthContextValue {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  syncStatus: "idle" | "syncing" | "ok" | "error";
  syncMessage: string | null;
  lastSyncedAt: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [syncStatus, setSyncStatus] = useState<AuthContextValue["syncStatus"]>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    if (!configured || !session?.user) return;

    const syncKey = `app-financas-pulled-${session.user.id}`;
    if (sessionStorage.getItem(syncKey) === "1") return;

    let cancelled = false;

    (async () => {
      setSyncStatus("syncing");
      const result = await pullFinanceData(session.user.id);
      if (cancelled) return;

      if (!result.ok) {
        setSyncStatus("error");
        setSyncMessage(result.error);
        return;
      }

      sessionStorage.setItem(syncKey, "1");
      setSyncStatus("ok");
      setLastSyncedAt(result.updatedAt);

      if (result.hadCloudData) {
        window.location.reload();
        return;
      }

      const pushResult = await pushFinanceData(session.user.id);
      if (!pushResult.ok) {
        setSyncStatus("error");
        setSyncMessage(pushResult.error);
        return;
      }
      setLastSyncedAt(pushResult.updatedAt);
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, session?.user?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return "Supabase não configurado.";

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return "Supabase não configurado.";

    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (session?.user) {
      sessionStorage.removeItem(`app-financas-pulled-${session.user.id}`);
    }
    if (!supabase) return;
    await supabase.auth.signOut();
    setLastSyncedAt(null);
    setSyncStatus("idle");
    setSyncMessage(null);
  }, [session?.user]);

  const syncNow = useCallback(async () => {
    if (!session?.user) return;

    setSyncStatus("syncing");
    const result = await pushFinanceData(session.user.id);
    if (result.ok) {
      setSyncStatus("ok");
      setSyncMessage(null);
      setLastSyncedAt(result.updatedAt);
    } else {
      setSyncStatus("error");
      setSyncMessage(result.error);
    }
  }, [session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      ready,
      session,
      user: session?.user ?? null,
      syncStatus,
      syncMessage,
      lastSyncedAt,
      signIn,
      signUp,
      signOut,
      syncNow,
    }),
    [
      configured,
      ready,
      session,
      syncStatus,
      syncMessage,
      lastSyncedAt,
      signIn,
      signUp,
      signOut,
      syncNow,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
