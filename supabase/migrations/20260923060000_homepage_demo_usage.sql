-- Tracks the homepage's one-free-try Mantha demo (src/components/premium/DesignGenerator.tsx),
-- so an anonymous visitor can redesign a photo once without signing up. Enforced by
-- device id (a client-generated id persisted in localStorage) and, as a backstop against
-- clearing storage, by IP — whichever hits first blocks a second attempt. Only the
-- demo-redesign edge function (service role) touches this table; no public policies.

create table if not exists public.homepage_demo_usage (
  device_id text primary key,
  ip inet not null,
  used_at timestamptz not null default now()
);

create index if not exists homepage_demo_usage_ip_idx on public.homepage_demo_usage (ip);

alter table public.homepage_demo_usage enable row level security;
-- No policies: only the service-role client (used exclusively by demo-redesign) can
-- read or write this table, matching how generate-redesign's admin client manages
-- storage and refunds outside of RLS.
