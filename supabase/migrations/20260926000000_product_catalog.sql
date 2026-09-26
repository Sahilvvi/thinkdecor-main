-- Real-product catalog: lets a redesign use actual, specific real products
-- (a real sofa, a real bed) as reference images for Gemini, instead of only
-- ever inventing furniture from a text prompt. Products are ingested from
-- OpenWeb Ninja's e-commerce API (or entered by hand) into this table, then
-- generate-redesign sends the chosen ones to Gemini alongside the room photo.
--
-- Two image fields per product on purpose: display_image_url is whatever
-- looks best in the catalog browsing UI; composite_image_url is the cleanest
-- (ideally plain-background) shot actually sent to Gemini — the two aren't
-- always the same photo, and compositing accuracy depends on picking the
-- right one, not on how nice the catalog thumbnail looks.

create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  category            text not null
                        check (category in (
                          'sofa', 'bed', 'chair', 'coffee_table', 'dining_table',
                          'lamp', 'rug', 'storage', 'decor', 'other'
                        )),
  brand               text,
  price               numeric,
  currency            text not null default 'GBP',
  display_image_url   text not null,
  composite_image_url text not null,
  source_retailer     text
                        check (source_retailer in (
                          'wayfair', 'amazon', 'walmart', 'home_depot',
                          'costco', 'ebay', 'google_shopping', 'manual'
                        )),
  source_sku          text,
  source_url           text,
  -- Room types this fits, using the same keys as src/lib/templates.ts's
  -- ROOM_TYPES ('living' | 'bedroom' | 'kitchen' | 'dining' | 'office' | 'bathroom').
  room_types          text[] not null default '{}',
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category) where active;
create index if not exists products_room_types_idx on public.products using gin (room_types) where active;
create unique index if not exists products_source_sku_uniq
  on public.products (source_retailer, source_sku)
  where source_sku is not null;

alter table public.products enable row level security;

-- Catalog is public read (anyone browsing Create should see it, signed in or not);
-- only admins manage it, same model as blog_posts.
drop policy if exists "public reads active products" on public.products;
create policy "public reads active products"
  on public.products for select
  to anon, authenticated
  using (active);

drop policy if exists "admins read all products" on public.products;
create policy "admins read all products"
  on public.products for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins insert products" on public.products;
create policy "admins insert products"
  on public.products for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update products" on public.products;
create policy "admins update products"
  on public.products for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete products" on public.products;
create policy "admins delete products"
  on public.products for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------ generation_products
-- Which real products were used in a given generation — for a future "shop
-- this look" link and for analytics on which products actually get picked.
create table if not exists public.generation_products (
  generation_id uuid not null references public.generations(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  primary key (generation_id, product_id)
);

alter table public.generation_products enable row level security;

drop policy if exists "read own generation products" on public.generation_products;
create policy "read own generation products"
  on public.generation_products for select
  to authenticated
  using (
    exists (
      select 1 from public.generations g
      where g.id = generation_id and g.user_id = auth.uid()
    )
  );

-- Written only by generate-redesign (service role), never directly by the client.

-- ---------------------------------------------------------------- product-media
-- Storage for manually-uploaded product photos (ingested products keep their
-- original source_url image instead). Public read, admin-only write.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists "public reads product media" on storage.objects;
create policy "public reads product media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-media');

drop policy if exists "admins upload product media" on storage.objects;
create policy "admins upload product media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update product media" on storage.objects;
create policy "admins update product media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete product media" on storage.objects;
create policy "admins delete product media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-media' and public.has_role(auth.uid(), 'admin'));
