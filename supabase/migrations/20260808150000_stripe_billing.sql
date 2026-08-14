-- =====================================================================
-- Stripe billing: customers, subscriptions, credits, payments
-- =====================================================================
-- Written by the stripe-webhook edge function using the SERVICE ROLE key,
-- which bypasses RLS. The policies below only govern what a signed-in
-- customer may READ about themselves. Nothing here is client-writable —
-- entitlements must never be settable from the browser.

-- ---------------------------------------------------------------- customers
create table if not exists public.billing_customers (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  email              text,
  created_at         timestamptz not null default now()
);

create index if not exists billing_customers_stripe_idx
  on public.billing_customers (stripe_customer_id);

alter table public.billing_customers enable row level security;

drop policy if exists "read own customer" on public.billing_customers;
create policy "read own customer"
  on public.billing_customers for select
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------ subscriptions
create table if not exists public.subscriptions (
  id                     text primary key,              -- Stripe subscription id
  user_id                uuid not null references auth.users(id) on delete cascade,
  status                 text not null,                 -- active | trialing | past_due | canceled | ...
  price_id               text,
  plan_key               text,                          -- 'starter' | 'studio' | 'scale'
  interval               text,                          -- 'month' | 'year'
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id, status);

alter table public.subscriptions enable row level security;

drop policy if exists "read own subscriptions" on public.subscriptions;
create policy "read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------ credits
-- Append-only ledger. The balance is derived, never stored as a mutable
-- number, so a bad write can be traced and reversed rather than silently
-- corrupting someone's balance.
create table if not exists public.credit_ledger (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  delta        integer not null,                        -- +granted / -spent
  reason       text not null,                           -- 'pack_purchase' | 'plan_renewal' | 'scan' | 'refund'
  reference    text,                                    -- Stripe object id, idempotency anchor
  created_at   timestamptz not null default now()
);

-- One credit grant per Stripe object. Makes webhook replays harmless.
create unique index if not exists credit_ledger_reference_uniq
  on public.credit_ledger (reference)
  where reference is not null;

create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;

drop policy if exists "read own credits" on public.credit_ledger;
create policy "read own credits"
  on public.credit_ledger for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.credit_balance(_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(delta), 0)::int
  from public.credit_ledger
  where user_id = _user_id
$$;

-- ----------------------------------------------------------------- payments
create table if not exists public.payments (
  id                 text primary key,                  -- Stripe checkout session / invoice id
  user_id            uuid references auth.users(id) on delete set null,
  email              text,
  amount_total       integer,                           -- minor units (pence)
  currency           text,
  mode               text,                              -- 'payment' | 'subscription'
  product_key        text,                              -- plan or pack key
  status             text,
  created_at         timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "read own payments" on public.payments;
create policy "read own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin panel can see all payments (same model as leads/articles).
drop policy if exists "authenticated reads payments" on public.payments;
create policy "authenticated reads payments"
  on public.payments for select
  to authenticated
  using (true);

-- ------------------------------------------------ webhook replay protection
create table if not exists public.stripe_events (
  id           text primary key,                        -- Stripe event id
  type         text,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- no policies: service role only
