create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  unit_id text not null,
  name text not null,
  email text not null,
  company text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

-- Users can submit standard inquiries anonymously, or attached to their user_id
create policy "Anyone can insert quote requests"
  on public.quote_requests for insert
  with check ( true );

-- Users can view their own quote requests
create policy "Users can view own quote requests"
  on public.quote_requests for select
  using ( auth.uid() = user_id );
