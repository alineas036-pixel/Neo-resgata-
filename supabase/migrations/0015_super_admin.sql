-- Resgata+: autorização exclusiva do Administrador Geral

create table if not exists public.super_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- A tabela não terá acesso direto pelos usuários da aplicação.
alter table public.super_admin_users enable row level security;

revoke all on public.super_admin_users from public, anon, authenticated;

-- Verifica a permissão do Administrador Geral sem expor a tabela.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.super_admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;
