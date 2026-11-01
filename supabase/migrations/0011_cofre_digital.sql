-- Cofre Digital: saldo separado das contas bancárias.
-- Depósitos e retiradas são registrados no histórico.
-- Não altera os saldos de wallet_accounts.

create table public.digital_vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.digital_vault_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vault_id uuid not null references public.digital_vaults(id) on delete cascade,
  operation text not null check (operation in ('deposito', 'retirada')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create index digital_vault_movements_user_date_idx
  on public.digital_vault_movements(user_id, created_at desc);

alter table public.digital_vaults enable row level security;
alter table public.digital_vault_movements enable row level security;

create policy "Users read own digital vault"
  on public.digital_vaults for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users read own vault movements"
  on public.digital_vault_movements for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.digital_vaults from anon, authenticated;
grant select on public.digital_vaults to authenticated;

revoke all on public.digital_vault_movements from anon, authenticated;
grant select on public.digital_vault_movements to authenticated;

create or replace function public.move_digital_vault(
  p_operation text,
  p_amount numeric,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_user uuid := auth.uid();
  v_vault_id uuid;
  v_balance numeric(12,2);
  v_amount numeric(12,2);
begin
  if v_user is null then
    raise exception 'Faça login para movimentar o cofre.';
  end if;

  if p_operation not in ('deposito', 'retirada') then
    raise exception 'Operação inválida.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;

  v_amount := round(p_amount, 2);

  if v_amount <= 0 then
    raise exception 'O valor informado é muito pequeno.';
  end if;

  insert into public.digital_vaults (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select id, balance
    into v_vault_id, v_balance
    from public.digital_vaults
   where user_id = v_user
   for update;

  if p_operation = 'retirada' and v_balance < v_amount then
    raise exception 'Saldo insuficiente no Cofre Digital.';
  end if;

  if p_operation = 'deposito' then
    update public.digital_vaults
       set balance = balance + v_amount,
           updated_at = pg_catalog.now()
     where id = v_vault_id
     returning balance into v_balance;
  else
    update public.digital_vaults
       set balance = balance - v_amount,
           updated_at = pg_catalog.now()
     where id = v_vault_id
     returning balance into v_balance;
  end if;

  insert into public.digital_vault_movements (
    user_id, vault_id, operation, amount, note
  )
  values (
    v_user, v_vault_id, p_operation, v_amount,
    nullif(pg_catalog.btrim(p_note), '')
  );

  return pg_catalog.jsonb_build_object(
    'success', true,
    'balance', v_balance
  );
end;
$function$;

revoke all on function public.move_digital_vault(text, numeric, text)
  from public, anon;

grant execute on function public.move_digital_vault(text, numeric, text)
  to authenticated;
