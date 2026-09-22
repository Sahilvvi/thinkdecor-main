-- Super admin panel: account bans, customer support tickets, lightweight
-- visitor analytics. Promote/demote already works via public.user_roles
-- (see 20260914100000_lock_admin_data.sql) — this adds what's missing.

-- ------------------------------------------------------------------ bans
alter table public.profiles
  add column if not exists banned_at timestamptz;

-- spend_credit() is the single choke point every generation path calls
-- (generate-redesign, repaint-floor, repaint-walls), so gating there blocks
-- a banned account from generating anywhere without touching RLS on every
-- table they can still read (billing history, past designs, etc. stay visible
-- to them — banning suspends the product, it doesn't erase their record).
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

  if exists (select 1 from public.profiles where user_id = uid and banned_at is not null) then
    raise exception 'This account has been suspended.' using errcode = 'P0001';
  end if;

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

revoke execute on function public.spend_credit() from anon, public;
grant execute on function public.spend_credit() to authenticated;

-- ---------------------------------------------------------- support tickets
create table if not exists public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject      text not null,
  message      text not null,
  status       text not null default 'open' check (status in ('open', 'answered', 'resolved')),
  admin_reply  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists support_tickets_user_idx on public.support_tickets (user_id, created_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets (status, created_at desc);

alter table public.support_tickets enable row level security;

drop policy if exists "read own or admin tickets" on public.support_tickets;
create policy "read own or admin tickets"
  on public.support_tickets for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "insert own tickets" on public.support_tickets;
create policy "insert own tickets"
  on public.support_tickets for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "admins update tickets" on public.support_tickets;
create policy "admins update tickets"
  on public.support_tickets for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

alter publication supabase_realtime add table public.support_tickets;
alter table public.support_tickets replica identity full;

-- ------------------------------------------------------- visitor analytics
-- One row per page load. Deliberately minimal (no IP, no fingerprinting) —
-- just enough for the admin overview to chart traffic and correlate it with
-- signups. Anyone (including signed-out visitors) can insert; only admins
-- can read it back.
create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

drop policy if exists "anyone inserts page views" on public.page_views;
create policy "anyone inserts page views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views"
  on public.page_views for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
