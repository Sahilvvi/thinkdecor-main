-- Phase 2 — authenticated app: phone on signup, generation history, credit spending.
--
-- Credits model (reuses the ledger from 20260808150000_stripe_billing.sql rather
-- than adding a parallel counter):
--     signup            → +2  ('signup_bonus')
--     each generation   → -1  ('scan')
--     paid renewal      → +20 ('plan_renewal', already granted by stripe-webhook)
-- public.credit_balance(user_id) stays the single source of truth, and
-- "balance > 0" is the entire gating rule for generating.

-- ---------------------------------------------------------------- profiles
-- Signup now collects a phone number. Nullable: existing rows predate it, and
-- it is never required to use the product.
alter table public.profiles
  add column if not exists phone text;

-- ------------------------------------------------------- new-user bootstrap
-- Extends the existing trigger: also stores phone, and seeds the two free
-- redesigns every account starts with.
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (user_id, name, email, phone)
    values (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        new.raw_user_meta_data->>'phone'
    );

    insert into public.user_roles (user_id, role)
    values (new.id, 'user');

    -- Two free generations. reference is namespaced by user id so a replay
    -- can never double-grant. The unique index on credit_ledger.reference is
    -- PARTIAL (where reference is not null), so ON CONFLICT must repeat that
    -- predicate — without it Postgres rejects the statement and signup fails.
    insert into public.credit_ledger (user_id, delta, reason, reference)
    values (new.id, 2, 'signup_bonus', 'signup:' || new.id::text)
    on conflict (reference) where reference is not null do nothing;

    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ------------------------------------------------------------- generations
create table if not exists public.generations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  input_image_url   text not null,
  output_image_url  text,
  template_key      text,
  room_type         text,
  prompt            text,
  status            text not null default 'completed'
                      check (status in ('pending', 'completed', 'failed')),
  created_at        timestamptz not null default now()
);

create index if not exists generations_user_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

drop policy if exists "read own generations" on public.generations;
create policy "read own generations"
  on public.generations for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert own generations" on public.generations;
create policy "insert own generations"
  on public.generations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "delete own generations" on public.generations;
create policy "delete own generations"
  on public.generations for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------ spend_credit
-- credit_ledger has no INSERT policy on purpose — clients must never write to
-- it directly. This is the one sanctioned way to spend, and it refuses to go
-- below zero, so the free-tier limit cannot be bypassed from the browser.
create or replace function public.spend_credit()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  remaining integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Serialise spends per user, so two tabs generating at once can't both pass
  -- the balance check on the last credit and drive the balance negative.
  perform pg_advisory_xact_lock(hashtext(uid::text));

  if public.credit_balance(uid) <= 0 then
    raise exception 'no credits remaining' using errcode = 'P0001';
  end if;

  insert into public.credit_ledger (user_id, delta, reason)
  values (uid, -1, 'scan');

  select public.credit_balance(uid) into remaining;
  return remaining;
end;
$$;

revoke all on function public.spend_credit() from public;
grant execute on function public.spend_credit() to authenticated;
grant execute on function public.credit_balance(uuid) to authenticated;

-- --------------------------------------------------------- storage bucket
insert into storage.buckets (id, name, public)
values ('generations', 'generations', true)
on conflict (id) do nothing;

drop policy if exists "Users can view their own generations" on storage.objects;
create policy "Users can view their own generations"
on storage.objects for select
using (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can upload generations" on storage.objects;
create policy "Users can upload generations"
on storage.objects for insert
with check (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their generations" on storage.objects;
create policy "Users can delete their generations"
on storage.objects for delete
using (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);
