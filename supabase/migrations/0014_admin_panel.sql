-- Resgata+: acesso administrativo seguro

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Verifica a permissão sem expor a tabela de administradores.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- O administrador pode consultar perfis e assinaturas.
drop policy if exists "admin_read_users" on public.users;
create policy "admin_read_users"
on public.users for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "admin_read_subscriptions" on public.subscriptions;
create policy "admin_read_subscriptions"
on public.subscriptions for select
to authenticated
using ((select public.is_admin()));

-- Cada administrador pode consultar apenas seu próprio registro.
drop policy if exists "admin_read_own_record" on public.admin_users;
create policy "admin_read_own_record"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()));

grant select on public.admin_users to authenticated;
grant select on public.users to authenticated;
grant select on public.subscriptions to authenticated;
