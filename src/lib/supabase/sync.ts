import {
  applyFinanceBundle,
  collectFinanceBundle,
  type FinanceDataBundle,
} from "@/lib/supabase/finance-bundle";
import { getSupabaseClient } from "@/lib/supabase/client";

export type SyncResult =
  | { ok: true; updatedAt: string; hadCloudData: boolean }
  | { ok: false; error: string };

function parseBundle(data: unknown): FinanceDataBundle | null {
  if (!data || typeof data !== "object") return null;
  const bundle = data as FinanceDataBundle;
  if (bundle.version !== 1) return null;
  if (!Array.isArray(bundle.recurring)) return null;
  return bundle;
}

export async function pullFinanceData(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase não configurado." };

  const { data, error } = await supabase
    .from("finance_snapshots")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  if (data?.data) {
    const bundle = parseBundle(data.data);
    if (bundle) {
      applyFinanceBundle(bundle);
      return {
        ok: true,
        updatedAt: data.updated_at ?? new Date().toISOString(),
        hadCloudData: true,
      };
    }
  }

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    hadCloudData: false,
  };
}

export async function pushFinanceData(userId: string): Promise<SyncResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase não configurado." };

  const bundle = collectFinanceBundle();
  const now = new Date().toISOString();

  const { error } = await supabase.from("finance_snapshots").upsert(
    {
      user_id: userId,
      data: bundle,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, updatedAt: now, hadCloudData: true };
}
