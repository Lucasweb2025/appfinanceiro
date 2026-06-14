"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui";
import {
  fetchAdminUsers,
  isAdminEmail,
  type AdminUserRow,
} from "@/lib/supabase/admin-users";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export function AdminUsersCard({ adminEmail }: { adminEmail: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminUsers();
    setUsers(result.users);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card title="Usuários do sistema">
      <p className="mb-4 text-sm text-slate-600">
        Lista de contas cadastradas no app (visível só para admin:{" "}
        <strong>{adminEmail}</strong>).
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando usuários...</p>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum usuário cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium">Última sync</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatWhen(user.registeredAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatWhen(user.lastSync)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={() => void load()}
        className="mt-4 w-full rounded-2xl bg-slate-100 py-3 text-sm font-medium text-slate-700"
      >
        Atualizar lista
      </button>

      <p className="mt-3 text-xs text-slate-500">
        No Supabase: Table Editor → <strong>user_profiles</strong> ou rode a view{" "}
        <strong>admin_users_overview</strong> no SQL Editor.
      </p>
    </Card>
  );
}

export { isAdminEmail };
