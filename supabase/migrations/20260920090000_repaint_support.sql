-- Floor + wall repaint support — adds columns to the existing `generations`
-- table rather than a parallel one, since it's the same "one photo in, one
-- design out" shape as generate-redesign. `kind` distinguishes what produced
-- each row; `session_id` lets the repaint-floor/repaint-walls edge functions
-- reuse an already-uploaded room photo across several tries (new texture,
-- new color) without asking the browser to re-upload it.

alter table public.generations
  add column if not exists kind text not null default 'redesign'
    check (kind in ('redesign', 'repaint_floor', 'repaint_walls')),
  add column if not exists session_id text,
  add column if not exists meta jsonb;

-- Looked up by repaint-floor/repaint-walls to find the room photo that
-- started a session when the caller sends sessionId without a fresh upload.
create index if not exists generations_session_idx
  on public.generations (session_id)
  where session_id is not null;
