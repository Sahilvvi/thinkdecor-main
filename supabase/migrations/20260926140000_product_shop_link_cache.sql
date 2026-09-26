-- Caches the resolved real-retailer link from product-link's live Product
-- Offers lookup, so repeat clicks on the same product (by anyone) skip the
-- external API call entirely and redirect instantly. Refreshed if stale.
alter table public.products
  add column if not exists resolved_shop_url text,
  add column if not exists resolved_shop_url_at timestamptz;
