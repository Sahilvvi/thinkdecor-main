-- The admin Overview page (src/lib/admin.ts) reads `generations` client-side
-- with the signed-in admin's own session, so it's subject to RLS like any
-- other read. Every other stat on that page (payments, page_views, support
-- tickets, profiles) already has an "admins read all" policy from an
-- earlier migration -- `generations` was missed, so "Designs generated" and
-- the by-kind breakdown always showed 0 for an admin with no designs of
-- their own, no matter how many other users had actually generated.
drop policy if exists "admins read all generations" on public.generations;
create policy "admins read all generations"
  on public.generations for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
