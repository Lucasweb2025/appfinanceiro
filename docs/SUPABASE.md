# Configurar Supabase

## 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Em **SQL Editor**, rode o arquivo `supabase/schema.sql`.
3. Depois rode `supabase/schema-users.sql` (lista de usuários + admin).

## 2. Autenticação

1. **Authentication → Providers → Email** — deixe habilitado.
2. Para testes rápidos, desative **Confirm email** em Authentication → Settings.

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=seu-email@exemplo.com
```

Sem essas variáveis o app funciona só com **localStorage** (modo offline/local).

## 4. Ver todos os usuários

### No painel Supabase

- **Authentication → Users** — contas criadas no login.
- **Table Editor → user_profiles** — mesma lista com e-mail e data de cadastro.
- **SQL Editor** — `select * from admin_users_overview;` inclui última sincronização.

### No app (admin)

1. No `schema-users.sql`, troque `seu-email@exemplo.com` pelo seu e-mail real na tabela `admin_allowlist` e rode de novo (ou insira manualmente no Table Editor).
2. Coloque o mesmo e-mail em `NEXT_PUBLIC_ADMIN_EMAIL` no `.env.local`.
3. Faça login com esse e-mail → **Config** → card **Usuários do sistema** (tabela com e-mail, cadastro e última sync).

## 5. GitHub Pages

Em **Settings → Secrets and variables → Actions**, crie estes **Repository secrets**:

| Secret | Valor |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave publishable/anon do Supabase |
| `NEXT_PUBLIC_ADMIN_EMAIL` | e-mail admin (ex.: lucaspweb@gmail.com) |

O workflow `deploy-pages.yml` injeta esses valores no build. O site fica em:

`https://lucasweb2025.github.io/appfinanceiro/`

Também configure no Supabase **Authentication → URL Configuration**:

- **Site URL:** `https://lucasweb2025.github.io/appfinanceiro/`
- **Redirect URLs:** `https://lucasweb2025.github.io/appfinanceiro/**`

## 6. Sincronização

- **Login** → baixa dados da nuvem (se existirem) ou envia o perfil local na primeira vez.
- Alterações são enviadas automaticamente (~3 s após mudar algo).
- **Config → Sincronizar agora** força upload manual.
