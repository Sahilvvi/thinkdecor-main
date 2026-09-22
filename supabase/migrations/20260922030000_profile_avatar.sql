-- Profile photo. Public bucket (avatars appear in the app header/dropdown,
-- no need to sign a URL for that), folder-per-user so one person can only
-- ever write their own file — same pattern as the `generations` bucket.
alter table public.profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public reads avatars" on storage.objects;
create policy "public reads avatars"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "users upload their own avatar" on storage.objects;
create policy "users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users update their own avatar" on storage.objects;
create policy "users update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users delete their own avatar" on storage.objects;
create policy "users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
