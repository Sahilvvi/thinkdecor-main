-- Visits recorded before referrer tracking existed have referrer = NULL: report them as "Not tracked yet"
-- instead of pretending they were direct. New visits store '' for direct traffic.
create or replace function public.super_pv_sources(p_days integer)
returns table (source text, visitors bigint)
language sql stable security definer set search_path = public as $$
  select case
           when coalesce(utm_source, '') <> '' then lower(utm_source)
           when referrer is null then 'Not tracked yet'
           when referrer = '' then 'Direct'
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
revoke all on function public.super_pv_sources(integer) from public, anon, authenticated;
grant execute on function public.super_pv_sources(integer) to service_role;
