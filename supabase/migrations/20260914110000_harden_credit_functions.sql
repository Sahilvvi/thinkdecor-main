-- Tighten who can call the credit functions.
--
-- credit_balance(_user_id) is security definer, so without a check any signed-in
-- user could read anyone's balance by passing their id. It now returns only the
-- caller's own balance; the service role (no auth.uid()) can still read any.
--
-- Supabase grants EXECUTE on public-schema functions to anon by default, which
-- `revoke ... from public` alone doesn't undo. Signed-out visitors have no
-- reason to call either function, so anon loses EXECUTE explicitly.
begin;

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
    and (auth.uid() = _user_id or auth.uid() is null)
$$;

revoke execute on function public.credit_balance(uuid) from anon, public;
revoke execute on function public.spend_credit() from anon, public;
grant execute on function public.credit_balance(uuid) to authenticated;
grant execute on function public.spend_credit() to authenticated;

commit;
