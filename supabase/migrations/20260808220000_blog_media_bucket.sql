-- Storage for blog images: cover photos and inline article images.
--
-- Public read (they appear on the public journal), authenticated write.
-- Only signed-in admins can upload or delete.

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "public reads blog media" on storage.objects;
create policy "public reads blog media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "authenticated uploads blog media" on storage.objects;
create policy "authenticated uploads blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media');

drop policy if exists "authenticated updates blog media" on storage.objects;
create policy "authenticated updates blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "authenticated deletes blog media" on storage.objects;
create policy "authenticated deletes blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media');
