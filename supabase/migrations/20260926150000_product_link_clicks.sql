-- Logs every "shop this" click (see product-link) so the admin catalog page
-- can show which real products people actually click through on, instead of
-- guessing what to import more of.
create table if not exists public.product_link_clicks (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create index if not exists product_link_clicks_product_idx on public.product_link_clicks (product_id);

alter table public.product_link_clicks enable row level security;

-- Written only by product-link (service role); admins can read the log for
-- the analytics view, same trust model as everywhere else in the catalog.
drop policy if exists "admins read product link clicks" on public.product_link_clicks;
create policy "admins read product link clicks"
  on public.product_link_clicks for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
