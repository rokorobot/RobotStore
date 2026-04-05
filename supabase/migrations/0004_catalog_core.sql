create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  website_url text,
  logo_url text,
  short_description text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.brands enable row level security;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  hero_text text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classes enable row level security;

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique not null,
  name text not null,
  subtitle text not null,
  brand_id uuid references public.brands(id),
  class_id uuid references public.classes(id),
  description text not null,
  short_description text not null,
  currency text not null default 'USD',
  price_cents integer,
  purchase_mode text not null,
  status text not null,
  featured boolean not null default false,
  stripe_price_id text,
  images jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  capabilities text[] not null default '{}',
  behavioral_profile text[] not null default '{}',
  deployment_fit text[] not null default '{}',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.units enable row level security;
