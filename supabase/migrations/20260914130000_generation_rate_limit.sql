-- Cap generations per user per hour.
--
-- Enforced inside spend_credit(), the single place every generation passes
-- through, so the cap holds for both the placeholder path and the live
-- generate-redesign edge function, and can't be skipped from the browser.
-- Keep HOURLY_GENERATION_LIMIT in src/lib/generation.ts in sync.

create or replace function public.spend_credit()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  remaining integer;
  recent integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Serialise spends per user, so two tabs generating at once can't both pass
  -- the checks below on the same last credit.
  perform pg_advisory_xact_lock(hashtext(uid::text));

  select count(*) into recent
    from public.credit_ledger
   where user_id = uid
     and reason = 'scan'
     and created_at > now() - interval '1 hour';

  if recent >= 10 then
    raise exception 'rate limited: too many generations in the last hour' using errcode = 'P0001';
  end if;

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
