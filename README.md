# App Finanças

> **Em construção** — funcionalidades e deploy ainda sendo ajustados.

Controle de receitas fixas, despesas fixas, variáveis, cartões e metas — com saldo em conta, assistente e sincronização na nuvem.

**Demo (beta):** [lucasweb2025.github.io/appfinanceiro](https://lucasweb2025.github.io/appfinanceiro/)

---

## O que o app faz

- **Início** — saldo, disponível para gastar e resumo do mês
- **Fixos / Variáveis / Cartões / Metas** — cadastro e acompanhamento
- **“Já paguei”** — controle do mês (não desconta de novo do saldo conferido)
- **Saldo em conta** — foto real do banco em Config
- **Login + nuvem** — Supabase (opcional; sem config usa só localStorage)
- **PWA** — instalar no celular
- **Notificações** — aviso de contas vencidas ou que vencem hoje
- **Admin** — tabela de usuários em Config (e-mail admin)

---

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind
- Vitest · Playwright
- Supabase (auth + sync)
- GitHub Pages (deploy estático)

---

## Rodar no PC

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Supabase (login + sync)

1. Copie `.env.example` → `.env.local`
2. Preencha URL, chave anon/publishable e e-mail admin
3. Rode os SQL em `supabase/schema.sql` e `supabase/schema-users.sql`

Guia completo: [`docs/SUPABASE.md`](docs/SUPABASE.md)

---

## Deploy (GitHub Pages)

Push na branch `main` dispara o workflow **Deploy GitHub Pages**.

Variáveis `NEXT_PUBLIC_*` do Supabase estão no [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (são públicas no bundle do navegador).

No Supabase → **Authentication → URL Configuration**:

- Site URL: `https://lucasweb2025.github.io/appfinanceiro/`
- Redirect URLs: `https://lucasweb2025.github.io/appfinanceiro/**`

---

## Testes

| Comando | O quê |
|---------|--------|
| `npm test` | Unitários + perfil Lucas + cenários |
| `npm run test:load` | Carga (120 perfis × 3 dias) |
| `npm run test:scenarios` | 14 cenários fixos |
| `npm run test:e2e` | E2E com Playwright |

CI roda automaticamente em push/PR na `main`.

---

## Estrutura

```
src/
  app/              # páginas Next.js
  components/       # UI (auth, settings, movimentos…)
  hooks/            # auth, notificações
  lib/finance/      # motor (saldo, cotas, dashboard)
  lib/supabase/     # client, sync, admin
supabase/           # schema SQL
docs/               # guias
e2e/                # Playwright
```

---

## Licença

Projeto privado — uso pessoal.
