import { getSupabaseClient } from "@/lib/supabase/client";

export interface AdminUserRow {
  id: string;
  email: string;
  registeredAt: string;
  lastSync: string | null;
}

export function isAdminEmail(
  email: string | undefined,
  adminEmail: string | undefined
): boolean {
  if (!email || !adminEmail) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function fetchAdminUsers(): Promise<{
  users: AdminUserRow[];
  error: string | null;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { users: [], error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("admin_users_overview")
    .select("id, email, registered_at, last_sync");

  if (error) {
    return { users: [], error: error.message };
  }

  const users: AdminUserRow[] = (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    registeredAt: row.registered_at,
    lastSync: row.last_sync,
  }));

  return { users, error: null };
}
