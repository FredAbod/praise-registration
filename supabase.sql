-- Run this once in your Supabase project's SQL Editor
-- (Supabase dashboard -> SQL Editor -> New query -> paste -> Run)

create extension if not exists "pgcrypto";

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists registrations_status_idx on registrations (status);

-- Row Level Security stays ON with no public policies. All reads/writes
-- happen through our Next.js API routes using the service role key, which
-- bypasses RLS. This keeps the table completely inaccessible to anyone
-- calling Supabase directly from a browser.
alter table registrations enable row level security;
