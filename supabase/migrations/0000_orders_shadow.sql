create table orders_shadow (
    id uuid default gen_random_uuid() primary key,
    stripe_session_id text not null unique,
    email text,
    amount_total integer,
    currency text,
    payment_status text,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Protect the table so it can only be touched by service_role (webhook).
-- You may eventually want authenticated users to view their own shadow_orders via RLS.
alter table orders_shadow enable row level security;
