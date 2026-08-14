-- Blog posts for the ThinkDecor site
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  cover_url    text,
  content      text not null default '',
  tag          text default 'Product',
  read_minutes int  default 4,
  author_name  text default 'ThinkDecor',
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published, published_at desc);

alter table public.blog_posts enable row level security;

-- anyone may read published posts
drop policy if exists "public reads published posts" on public.blog_posts;
create policy "public reads published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (published = true);

-- signed-in users manage everything (drafts included)
drop policy if exists "authenticated reads all posts" on public.blog_posts;
create policy "authenticated reads all posts"
  on public.blog_posts for select to authenticated using (true);

drop policy if exists "authenticated inserts posts" on public.blog_posts;
create policy "authenticated inserts posts"
  on public.blog_posts for insert to authenticated with check (true);

drop policy if exists "authenticated updates posts" on public.blog_posts;
create policy "authenticated updates posts"
  on public.blog_posts for update to authenticated using (true) with check (true);

drop policy if exists "authenticated deletes posts" on public.blog_posts;
create policy "authenticated deletes posts"
  on public.blog_posts for delete to authenticated using (true);

-- keep updated_at fresh
create or replace function public.touch_blog_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.published and old.published is distinct from true then
    new.published_at = coalesce(new.published_at, now());
  end if;
  return new;
end $$;

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before update on public.blog_posts
  for each row execute function public.touch_blog_updated_at();
