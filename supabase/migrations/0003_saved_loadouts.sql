create table if not exists public.saved_loadouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Tactical Loadout',
  items_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_loadouts enable row level security;

-- Users can select their own loadouts
create policy "Users can view own saved loadouts"
  on public.saved_loadouts for select
  using ( auth.uid() = user_id );

-- Users can insert their own loadouts (ensure they only insert as themselves)
create policy "Users can insert own loadouts"
  on public.saved_loadouts for insert
  with check ( auth.uid() = user_id );

-- Users can delete their own loadouts
create policy "Users can delete own loadouts"
  on public.saved_loadouts for delete
  using ( auth.uid() = user_id );
