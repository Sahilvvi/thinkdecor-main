-- Fix: publishing a BRAND NEW article left published_at NULL.
--
-- The original trigger was `before update` only. An article created with
-- published = true (Save & publish on a new post) therefore never got a
-- published_at, so the public blog rendered a blank date and the ordering
-- was undefined.
--
-- This adds the same handling on insert, and backfills anything already
-- affected.

create or replace function public.set_blog_published_at()
returns trigger language plpgsql as $$
begin
  if new.published and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end $$;

drop trigger if exists blog_posts_publish_insert on public.blog_posts;
create trigger blog_posts_publish_insert
  before insert on public.blog_posts
  for each row execute function public.set_blog_published_at();

-- backfill existing rows
update public.blog_posts
   set published_at = coalesce(published_at, updated_at, created_at, now())
 where published = true
   and published_at is null;
