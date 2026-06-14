-- =============================================================================
-- PARTE 2 — Perfis de usuário + painel admin (rode DEPOIS do schema.sql base)
-- =============================================================================

-- Tabela visível no Table Editor com todos que criaram conta
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Quem pode ver a lista completa no app (coloque SEU e-mail admin)
create table if not exists public.admin_allowlist (
  email text primary key
);

-- ⚠️ TROQUE pelo e-mail que você usa para logar no app:
insert into public.admin_allowlist (email)
values ('lucaspweb@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

-- Usuário comum só vê o próprio perfil
drop policy if exists "Users read own profile" on public.user_profiles;
create policy "Users read own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- Admin vê todos (para a tabela no app)
drop policy if exists "Admin read all profiles" on public.user_profiles;
create policy "Admin read all profiles"
  on public.user_profiles
  for select
  using (public.is_app_admin());

-- Admin também vê last_sync de todos
drop policy if exists "Admin read all finance snapshots" on public.finance_snapshots;
create policy "Admin read all finance snapshots"
  on public.finance_snapshots
  for select
  using (public.is_app_admin());

-- Novos cadastros entram automaticamente em user_profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, created_at)
  values (new.id, coalesce(new.email, ''), coalesce(new.created_at, now()))
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Usuários que já existiam antes deste script
insert into public.user_profiles (id, email, created_at)
select id, coalesce(email, ''), coalesce(created_at, now())
from auth.users
on conflict (id) do update
  set email = excluded.email;

-- View para ver no SQL Editor / Table Editor (opcional)
create or replace view public.admin_users_overview
with (security_invoker = true) as
select
  p.id,
  p.email,
  p.created_at as registered_at,
  f.updated_at as last_sync
from public.user_profiles p
left join public.finance_snapshots f on f.user_id = p.id
order by p.created_at desc;

grant select on public.admin_users_overview to authenticated;
