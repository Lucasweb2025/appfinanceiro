-- Execute no SQL Editor do Supabase (Dashboard → SQL)
-- Pode rodar de novo sem erro (políticas são recriadas).

create table if not exists public.finance_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.finance_snapshots enable row level security;

drop policy if exists "Users read own finance data" on public.finance_snapshots;
create policy "Users read own finance data"
  on public.finance_snapshots
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own finance data" on public.finance_snapshots;
create policy "Users insert own finance data"
  on public.finance_snapshots
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own finance data" on public.finance_snapshots;
create policy "Users update own finance data"
  on public.finance_snapshots
  for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own finance data" on public.finance_snapshots;
create policy "Users delete own finance data"
  on public.finance_snapshots
  for delete
  using (auth.uid() = user_id);
