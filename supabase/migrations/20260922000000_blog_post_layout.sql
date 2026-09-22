-- Per-article layout controls for blog posts, so the admin editor can fix
-- spacing/image-sizing glitches on a specific article without a full
-- block-editor rewrite (content stays plain markdown; this is metadata
-- read by BlogPost.tsx to pick which .post-body modifier classes to apply).
--
-- Shape (all optional, all default to the current fixed look):
--   { "proseWidth": "normal" | "wide",
--     "rhythm":     "compact" | "normal" | "relaxed",
--     "imageStyle": "inline" | "full" }
alter table public.blog_posts
  add column if not exists layout jsonb not null default '{}'::jsonb;
