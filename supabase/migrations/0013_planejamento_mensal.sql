-- Planejamento mensal por usuário.
-- Armazena previsões, sem movimentar saldos ou registrar pagamentos.

create table public.monthly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null
    check (month_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  income numeric(12,2) not null default 0 check (income >= 0),
  essentials numeric(12,2) not null default 0 check (essentials >= 0),
  other_expenses numeric(12,2) not null default 0 check (other_expenses >= 0),
  debt_goal numeric(12,2) not null default 0 check (debt_goal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_plans_user_month_unique unique (user_id, month_key)
);

create index monthly_plans_user_month_idx
  on public.monthly_plans (user_id, month_key);

alter table public.monthly_plans enable row level security;

create policy "monthly_plans_select_own"
  on public.monthly_plans for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "monthly_plans_insert_own"
  on public.monthly_plans for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "monthly_plans_update_own"
  on public.monthly_plans for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "monthly_plans_delete_own"
  on public.monthly_plans for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.monthly_plans from anon;
grant select, insert, update, delete
  on public.monthly_plans to authenticated;
