-- Admin Overview numbers, counted in the database.
--
-- The dashboard used to download every page_views / generations / profiles row
-- and count them in the browser. PostgREST silently caps a response at 1,000
-- rows, so page views read "1000" when the real figure was 1030 - and it would
-- only get worse as traffic grows. This returns the totals already aggregated.
--
--   p_days = 7 | 30  -> that window for visitors / views / signups
--   p_days = null    -> all time
-- The daily series is always the last 7 days (p_days = 7) or 30 days (anything else).

create or replace function public.admin_overview_stats(p_days integer default 7)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since        timestamptz := case when p_days is null then '-infinity'::timestamptz
                                   else now() - make_interval(days => p_days) end;
  series_days  integer := case when p_days = 7 then 7 else 30 end;
  result       jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'admins only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'visitors',            (select count(distinct session_id) from public.page_views where created_at >= since),
    'pageViews',           (select count(*) from public.page_views where created_at >= since),
    'signupsTotal',        (select count(*) from public.profiles),
    'signups',             (select count(*) from public.profiles where created_at >= since),
    'generationsTotal',    (select count(*) from public.generations),
    'generations',         (select count(*) from public.generations where created_at >= since),
    'generationsByKind',   (
      select coalesce(jsonb_agg(jsonb_build_object('kind', k, 'count', n) order by n desc), '[]'::jsonb)
      from (
        select coalesce(kind, 'redesign') as k, count(*) as n
        from public.generations
        where created_at >= since
        group by 1
      ) g
    ),
    'revenuePence',        (select coalesce(sum(amount_total), 0) from public.payments where status = 'paid' and left(id, 8) <> 'cs_test_'),
    'activeSubscriptions', (select count(*) from public.subscriptions where status = 'active'),
    'openTickets',         (select count(*) from public.support_tickets where status = 'open'),
    'dailyViews',          (
      select jsonb_agg(jsonb_build_object('day', to_char(d, 'YYYY-MM-DD'), 'count', coalesce(v.n, 0)) order by d)
      from generate_series(
             (current_date - (series_days - 1))::timestamp,
             current_date::timestamp,
             interval '1 day'
           ) as d
      left join (
        select created_at::date as day, count(*) as n
        from public.page_views
        where created_at >= current_date - (series_days - 1)
        group by 1
      ) v on v.day = d::date
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_overview_stats(integer) from public, anon;
grant execute on function public.admin_overview_stats(integer) to authenticated;
