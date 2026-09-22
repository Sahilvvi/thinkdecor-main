-- Live updates for Overview/Projects: without this, a generation finishing
-- only shows up after the browser refetches (on navigation or a manual
-- action) — fine for the tab that triggered it, but not for another tab or
-- device watching the same account. RLS still applies to realtime changefeeds
-- exactly as it does to normal reads, so this doesn't widen who can see what.
alter publication supabase_realtime add table public.generations;

-- Realtime needs full row data on UPDATE (e.g. status flipping to
-- 'completed') to diff correctly, not just the primary key.
alter table public.generations replica identity full;
