-- Demo/lead requests from the B2B landing page
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  source text default 'landing-lead-form',
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

-- Anyone (anon) may submit a demo request; nobody may read them from the client
create policy "Allow anonymous demo request submissions"
  on public.demo_requests
  for insert
  to anon, authenticated
  with check (true);
