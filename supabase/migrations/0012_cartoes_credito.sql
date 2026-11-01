-- Cartões de crédito: dados separados das contas bancárias.
-- Cada usuário pode acessar somente os próprios cartões.

create table public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  bank_name text not null check (char_length(trim(bank_name)) between 1 and 80),
  credit_limit numeric(12,2) not null check (credit_limit > 0),
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index credit_cards_user_created_idx
  on public.credit_cards (user_id, created_at desc);

alter table public.credit_cards enable row level security;

create policy "credit_cards_select_own"
  on public.credit_cards
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "credit_cards_insert_own"
  on public.credit_cards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "credit_cards_update_own"
  on public.credit_cards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "credit_cards_delete_own"
  on public.credit_cards
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete
  on public.credit_cards to authenticated;
