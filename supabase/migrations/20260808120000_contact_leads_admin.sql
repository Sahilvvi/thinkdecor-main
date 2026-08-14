-- Let the signed-in admin panel read, triage and delete contact leads.
-- Mirrors the access model already used by public.blog_posts.
--
-- SECURITY NOTE: any account that can sign in can read leads. Turn OFF open
-- sign-ups in Supabase → Authentication → Providers → Email once your own
-- account exists, otherwise anyone could register and read customer details.

-- 1. triage columns -------------------------------------------------------
alter table public.contact_submissions
  add column if not exists status text not null default 'new',
  add column if not exists notes  text;

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

-- 2. policies -------------------------------------------------------------
-- keep the public insert policy (the contact form posts anonymously)
drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

-- replace the admin-role-only read with signed-in read, so the panel works
-- for the account you create at /admin without extra role wiring
drop policy if exists "Admins can view submissions" on public.contact_submissions;
drop policy if exists "authenticated reads submissions" on public.contact_submissions;
create policy "authenticated reads submissions"
  on public.contact_submissions for select
  to authenticated
  using (true);

drop policy if exists "authenticated updates submissions" on public.contact_submissions;
create policy "authenticated updates submissions"
  on public.contact_submissions for update
  to authenticated
  using (true) with check (true);

drop policy if exists "authenticated deletes submissions" on public.contact_submissions;
create policy "authenticated deletes submissions"
  on public.contact_submissions for delete
  to authenticated
  using (true);
