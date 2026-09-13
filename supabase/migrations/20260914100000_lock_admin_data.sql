-- Lock admin-only data to admins, now that customers can sign up.
--
-- Until Phase 2 the only accounts were CMS admins created by hand, so several
-- policies granted "any signed-in user" full access: every contact lead, every
-- payment, blog drafts and writes, and blog media uploads. With public
-- customer signup that would let any customer read every lead and payment and
-- rewrite the journal. Each of those policies is replaced with an admin-role
-- check via the existing public.has_role() (see 20260114161808_*.sql).
--
-- Admins are rows in public.user_roles with role = 'admin'. Promote an account
-- with:  insert into public.user_roles (user_id, role) values ('<uuid>', 'admin')
--        on conflict (user_id, role) do nothing;

-- ----------------------------------------------------- contact_submissions
-- Anonymous insert (the contact form) is unchanged.
drop policy if exists "authenticated reads submissions" on public.contact_submissions;
drop policy if exists "authenticated updates submissions" on public.contact_submissions;
drop policy if exists "authenticated deletes submissions" on public.contact_submissions;

drop policy if exists "admins read submissions" on public.contact_submissions;
create policy "admins read submissions"
  on public.contact_submissions for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update submissions" on public.contact_submissions;
create policy "admins update submissions"
  on public.contact_submissions for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete submissions" on public.contact_submissions;
create policy "admins delete submissions"
  on public.contact_submissions for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- payments
-- "read own payments" (customers see their own) is unchanged.
drop policy if exists "authenticated reads payments" on public.payments;

drop policy if exists "admins read payments" on public.payments;
create policy "admins read payments"
  on public.payments for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------------------------- blog_posts
-- "public reads published posts" is unchanged.
drop policy if exists "authenticated reads all posts" on public.blog_posts;
drop policy if exists "authenticated inserts posts" on public.blog_posts;
drop policy if exists "authenticated updates posts" on public.blog_posts;
drop policy if exists "authenticated deletes posts" on public.blog_posts;

drop policy if exists "admins read all posts" on public.blog_posts;
create policy "admins read all posts"
  on public.blog_posts for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins insert posts" on public.blog_posts;
create policy "admins insert posts"
  on public.blog_posts for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update posts" on public.blog_posts;
create policy "admins update posts"
  on public.blog_posts for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete posts" on public.blog_posts;
create policy "admins delete posts"
  on public.blog_posts for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------------------- blog-media bucket
-- "public reads blog media" is unchanged.
drop policy if exists "authenticated uploads blog media" on storage.objects;
drop policy if exists "authenticated updates blog media" on storage.objects;
drop policy if exists "authenticated deletes blog media" on storage.objects;

drop policy if exists "admins upload blog media" on storage.objects;
create policy "admins upload blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update blog media" on storage.objects;
create policy "admins update blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete blog media" on storage.objects;
create policy "admins delete blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));
