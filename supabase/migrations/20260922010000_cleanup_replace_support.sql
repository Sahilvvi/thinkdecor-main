-- Cleanup and Replace share the exact same "one photo, one prompt" redesign
-- model as Create (generate-redesign), just with a painted-on mask and a
-- fixed erase/replace prompt instead of a template — see the `mode` param
-- added to supabase/functions/generate-redesign/index.ts. This just widens
-- the existing `kind` check constraint (from 20260920090000_repaint_support.sql)
-- so those rows can be recorded and told apart in Library/Overview.
alter table public.generations
  drop constraint if exists generations_kind_check;

alter table public.generations
  add constraint generations_kind_check
    check (kind in ('redesign', 'repaint_floor', 'repaint_walls', 'cleanup', 'replace'));
