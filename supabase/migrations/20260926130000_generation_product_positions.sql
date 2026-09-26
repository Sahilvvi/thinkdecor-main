-- Where a composited real product actually landed in the result image, so the
-- UI can drop a clickable dot on it linking to the real listing — normalized
-- 0-1 coordinates (0,0 top-left), detected by a follow-up Gemini vision call
-- right after the image is generated (see generate-redesign). Nullable: the
-- detection call is best-effort and a miss just means no dot for that item.
alter table public.generation_products
  add column if not exists position_x numeric,
  add column if not exists position_y numeric;
