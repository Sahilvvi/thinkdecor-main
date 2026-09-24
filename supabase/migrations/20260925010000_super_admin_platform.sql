-- Super admin panel: audit log, settings, per-attempt AI usage/cost, pricing table, traffic source capture
-- and read-only aggregate functions. Everything here is service-role only: no policy is created,
-- so RLS denies anon and authenticated users completely. The `super-admin` edge function is the only reader/writer.

-- ------------------------------------------------------------------ audit log (append-only)
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  actor_id     uuid,
  actor_email  text,
  actor_role   text,
  action       text not null,
  target       text,
  before_value text,
  after_value  text,
  reason       text,
  severity     text not null default 'info' check (severity in ('info','warn','crit')),
  ip           text
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;

create or replace function public.audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log rows cannot be changed or deleted';
end $$;
drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update before update or delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- ------------------------------------------------------------------ settings
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.app_settings enable row level security;

insert into public.app_settings (key, value) values
  ('flags', '{"demo":true,"signups":true,"generation":true,"checkout":true,"maintenance":false}'),
  ('maintenance_text', '"Scheduled maintenance is under way. Designs in progress are saved."'),
  ('ai', '{"model":"gemini-3.1-flash-lite-image","fallback":["gemini-3.1-flash-lite-image","gemini-3.1-flash-image","gemini-2.5-flash-image"],"beautifier":"","kill_switch":false,"daily_cap_gbp":50,"cap_action":"demo","spike_pct":60,"alert_to":"","usd_gbp":0.79,"free_credits":2}'),
  ('demo', '{"per_ip":1,"per_device":1}'),
  ('security', '{"require_2fa":false,"timeout_min":30,"ip_allow":false,"ips":[]}')
on conflict (key) do nothing;

-- What the public site may know: switches and the banner text. Nothing else leaves the database.
create or replace function public.public_site_flags() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'flags', (select value from public.app_settings where key = 'flags'),
    'maintenance_text', (select value from public.app_settings where key = 'maintenance_text')
  );
$$;
revoke all on function public.public_site_flags() from public;
grant execute on function public.public_site_flags() to anon, authenticated;

-- ------------------------------------------------------------------ AI attempts + cost
create table if not exists public.generation_events (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  user_id        uuid,
  device_id      text,
  feature        text not null check (feature in ('redesign','cleanup','replace','demo','label')),
  model          text,
  status         text not null check (status in ('succeeded','failed')),
  latency_ms     integer,
  input_tokens   integer,
  output_tokens  integer,
  cost_gbp       numeric(12,6) not null default 0,
  error          text,
  generation_id  uuid,
  fallback_used  boolean not null default false
);
create index if not exists generation_events_created_idx on public.generation_events (created_at desc);
create index if not exists generation_events_user_idx on public.generation_events (user_id, created_at desc);
alter table public.generation_events enable row level security;

create table if not exists public.ai_pricing (
  model              text primary key,
  input_usd_per_m    numeric(10,4) not null default 0,
  output_usd_per_m   numeric(10,4) not null default 0,
  note               text,
  updated_at         timestamptz not null default now()
);
alter table public.ai_pricing enable row level security;
-- ESTIMATES: replace with the numbers on Google's pricing page (Model settings tab in the panel).
insert into public.ai_pricing (model, input_usd_per_m, output_usd_per_m, note) values
  ('gemini-3.1-flash-lite-image', 0.30, 30.00, 'estimate: check Google AI pricing'),
  ('gemini-3.1-flash-image',      0.30, 30.00, 'estimate: check Google AI pricing'),
  ('gemini-2.5-flash-image',      0.30, 30.00, 'estimate: check Google AI pricing'),
  ('gemini-3.5-flash-lite',       0.10,  0.40, 'estimate: prompt beautifier')
on conflict (model) do nothing;

-- ------------------------------------------------------------------ traffic sources
alter table public.page_views add column if not exists referrer text;
alter table public.page_views add column if not exists utm_source text;

-- ------------------------------------------------------------------ signup credits follow the setting
create or replace function public.handle_new_user()
returns trigger as $$
declare
  free_n integer := coalesce((select (value->>'free_credits')::integer from public.app_settings where key = 'ai'), 2);
begin
    insert into public.profiles (user_id, name, email, phone)
    values (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'phone');

    insert into public.user_roles (user_id, role) values (new.id, 'user');

    if free_n > 0 then
      insert into public.credit_ledger (user_id, delta, reason, reference)
      values (new.id, free_n, 'signup_bonus', 'signup:' || new.id::text)
      on conflict (reference) where reference is not null do nothing;
    end if;

    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ------------------------------------------------------------------ aggregates (service role only)
create or replace function public.super_pv_daily(p_days integer)
returns table (d date, views bigint, visitors bigint)
language sql stable security definer set search_path = public as $$
  select (created_at at time zone 'UTC')::date, count(*), count(distinct coalesce(session_id, id::text))
  from public.page_views
  where created_at >= now() - make_interval(days => p_days)
  group by 1 order by 1;
$$;

create or replace function public.super_pv_top(p_days integer)
returns table (path text, views bigint, visitors bigint)
language sql stable security definer set search_path = public as $$
  select path, count(*), count(distinct coalesce(session_id, id::text))
  from public.page_views
  where created_at >= now() - make_interval(days => p_days)
  group by 1 order by 2 desc limit 15;
$$;

create or replace function public.super_pv_sources(p_days integer)
returns table (source text, visitors bigint)
language sql stable security definer set search_path = public as $$
  select case
           when coalesce(utm_source, '') <> '' then lower(utm_source)
           when coalesce(referrer, '') = '' then 'Direct'
           when referrer ~* 'google\.' then 'Google'
           when referrer ~* 'bing\.' then 'Bing'
           when referrer ~* '(instagram|facebook|fb\.)' then 'Instagram / Facebook'
           when referrer ~* 'pinterest' then 'Pinterest'
           when referrer ~* '(chatgpt|openai|perplexity|claude\.ai|gemini\.google|copilot)' then 'AI search'
           when referrer ~* 'thinkdecor\.app|vercel\.app|localhost' then 'Internal'
           else 'Referral'
         end,
         count(distinct coalesce(session_id, id::text))
  from public.page_views
  where created_at >= now() - make_interval(days => p_days)
  group by 1 order by 2 desc;
$$;

create or replace function public.super_db_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'storage_objects', (select count(*) from storage.objects),
    'tables', coalesce((
      select jsonb_agg(jsonb_build_object('name', relname, 'bytes', pg_total_relation_size(c.oid)) order by pg_total_relation_size(c.oid) desc)
      from (select oid, relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by pg_total_relation_size(oid) desc limit 8) c
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.super_pv_daily(integer), public.super_pv_top(integer), public.super_pv_sources(integer), public.super_db_stats() from public, anon, authenticated;
grant execute on function public.super_pv_daily(integer), public.super_pv_top(integer), public.super_pv_sources(integer), public.super_db_stats() to service_role;
