-- Run this in Supabase SQL editor (Dashboard → SQL Editor)
-- Creates a lightweight analytics event store.
-- No PII. No external SDK. No cost.

create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,
  session_id  text,                  -- anonymous browser session token
  user_id     uuid references auth.users(id) on delete set null,
  properties  jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

-- Index the funnel column for fast aggregation
create index on public.analytics_events (event);
create index on public.analytics_events (created_at);
create index on public.analytics_events (session_id);

-- RLS: insert from anon/authenticated, read from service role only
alter table public.analytics_events enable row level security;

create policy "allow_insert_analytics"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

-- Only admins/service role can SELECT (protects session data)
-- Read via Supabase service role key from /admin or external tooling.
