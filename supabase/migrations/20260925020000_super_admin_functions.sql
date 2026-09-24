-- More read-only aggregates for the super admin panel (service role only).

-- One row per user: credits left, designs made, lifetime paid (pence), last design, tickets.
create or replace function public.super_user_stats()
returns table (user_id uuid, credits bigint, designs bigint, spend_pence bigint, last_gen timestamptz, tickets bigint, open_tickets bigint)
language sql stable security definer set search_path = public as $$
  select u.id,
         coalesce((select sum(delta) from public.credit_ledger l where l.user_id = u.id), 0),
         (select count(*) from public.generations g where g.user_id = u.id),
         coalesce((select sum(amount_total) from public.payments p where p.user_id = u.id and p.status = 'paid' and left(p.id, 8) <> 'cs_test_'), 0),
         (select max(created_at) from public.generations g where g.user_id = u.id),
         (select count(*) from public.support_tickets t where t.user_id = u.id),
         (select count(*) from public.support_tickets t where t.user_id = u.id and t.status <> 'resolved')
  from auth.users u;
$$;

-- Which accounts have a verified authenticator app (TOTP).
create or replace function public.super_mfa()
returns table (user_id uuid, verified bigint)
language sql stable security definer set search_path = public as $$
  select user_id, count(*) filter (where status = 'verified') from auth.mfa_factors group by user_id;
$$;

-- Latest sign-ins for one user, from Supabase's own auth audit trail.
create or replace function public.super_signins(p_user uuid)
returns table (at timestamptz, ip text, action text)
language sql stable security definer set search_path = public as $$
  select created_at, ip_address::text, payload->>'action'
  from auth.audit_log_entries
  where payload->>'actor_id' = p_user::text and payload->>'action' in ('login', 'token_refreshed')
  order by created_at desc limit 12;
$$;

-- The most recent sign-in IP per user (for the admin list and duplicate detection).
create or replace function public.super_last_ips()
returns table (user_id uuid, ip text, at timestamptz)
language sql stable security definer set search_path = public as $$
  select distinct on (payload->>'actor_id') (payload->>'actor_id')::uuid, ip_address::text, created_at
  from auth.audit_log_entries
  where payload->>'action' in ('login', 'token_refreshed', 'user_signedup') and payload->>'actor_id' is not null
  order by payload->>'actor_id', created_at desc;
$$;

-- Weekly signup cohorts: how many were active (made a design) k weeks later.
create or replace function public.super_retention()
returns table (cohort date, users bigint, k integer, active bigint)
language sql stable security definer set search_path = public as $$
  with c as (
    select id, (date_trunc('week', created_at))::date w from auth.users
    where created_at >= date_trunc('week', now()) - interval '9 weeks'
  ),
  a as (
    select user_id, (date_trunc('week', created_at))::date gw from public.generations group by 1, 2
  ),
  sizes as (select w, count(*) n from c group by w)
  select c.w, s.n, ((a.gw - c.w) / 7)::integer k, count(distinct c.id)
  from c join sizes s on s.w = c.w
  join a on a.user_id = c.id and a.gw >= c.w
  group by c.w, s.n, k
  union all
  select w, n, null::integer, 0 from sizes
  order by 1, 3;
$$;

revoke all on function public.super_user_stats(), public.super_mfa(), public.super_signins(uuid), public.super_last_ips(), public.super_retention() from public, anon, authenticated;
grant execute on function public.super_user_stats(), public.super_mfa(), public.super_signins(uuid), public.super_last_ips(), public.super_retention() to service_role;
