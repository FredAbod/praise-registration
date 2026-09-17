-- Youth Retreat registrations schema
-- Run in Supabase SQL Editor.
-- Archives Praise Unfiltered data instead of deleting it.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Archive old Praise Unfiltered registrations (keep for future reference)
-- ---------------------------------------------------------------------------
-- Only renames if the live table still has the old schema (pending/accepted/rejected).
-- Safe to re-run: skips archive if Youth Retreat schema is already live.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'registrations'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'receipt_url'
  ) then
    -- Rename table
    alter table registrations rename to registrations_praise_unfiltered_2026;

    -- Rename old index if present
    if exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relname = 'registrations_status_idx'
        and n.nspname = 'public'
    ) then
      alter index registrations_status_idx
        rename to registrations_praise_unfiltered_2026_status_idx;
    end if;

    -- Keep unique email constraint name tidy (optional)
    -- Archived table stays RLS-enabled; no public policies.
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Create Youth Retreat registrations table
-- ---------------------------------------------------------------------------
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'awaiting_review', 'confirmed', 'rejected')),
  receipt_url text,
  receipt_uploaded_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists registrations_status_idx on registrations (status);

-- Row Level Security stays ON with no public policies. All reads/writes
-- happen through Next.js API routes using the service role key.
alter table registrations enable row level security;

-- Archive table: also keep RLS on if it exists
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'registrations_praise_unfiltered_2026'
  ) then
    alter table registrations_praise_unfiltered_2026 enable row level security;
  end if;
end $$;
