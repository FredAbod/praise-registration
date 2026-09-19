-- Youth Retreat registrations schema
-- Run in Supabase SQL Editor.
-- Archives Praise Unfiltered data instead of deleting it.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Archive old Praise Unfiltered registrations (keep for future reference)
-- ---------------------------------------------------------------------------
-- Renames if the live table still has the old status values (no receipt_url).

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
    alter table registrations rename to registrations_praise_unfiltered_2026;

    if exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relname = 'registrations_status_idx'
        and n.nspname = 'public'
    ) then
      alter index registrations_status_idx
        rename to registrations_praise_unfiltered_2026_status_idx;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Create Youth Retreat registrations table (fresh installs)
-- ---------------------------------------------------------------------------
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  assembly text not null,
  district text not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'awaiting_review', 'confirmed', 'rejected')),
  receipt_url text,
  receipt_uploaded_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Migrate existing Youth Retreat table (email → assembly/district, etc.)
-- ---------------------------------------------------------------------------
do $$
begin
  -- Drop old email uniqueness / column if present
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'email'
  ) then
    alter table registrations drop constraint if exists registrations_email_key;
    alter table registrations drop column email;
  end if;

  -- Phone optional
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'phone'
  ) then
    alter table registrations alter column phone drop not null;
  else
    alter table registrations add column phone text;
  end if;

  -- Assembly + district
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'assembly'
  ) then
    alter table registrations add column assembly text;
    update registrations set assembly = 'Unknown' where assembly is null;
    alter table registrations alter column assembly set not null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'district'
  ) then
    alter table registrations add column district text;
    update registrations set district = 'Unknown' where district is null;
    alter table registrations alter column district set not null;
  end if;

  -- Payment columns (in case table was created with old Praise schema somehow)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'receipt_url'
  ) then
    alter table registrations add column receipt_url text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'receipt_uploaded_at'
  ) then
    alter table registrations add column receipt_uploaded_at timestamptz;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'confirmed_at'
  ) then
    alter table registrations add column confirmed_at timestamptz;
  end if;

  -- Fix status check (old: pending/accepted/rejected)
  alter table registrations drop constraint if exists registrations_status_check;
  alter table registrations
    add constraint registrations_status_check
    check (status in ('pending_payment', 'awaiting_review', 'confirmed', 'rejected'));

  -- Default status for new rows
  alter table registrations alter column status set default 'pending_payment';
end $$;

create index if not exists registrations_status_idx on registrations (status);

alter table registrations enable row level security;

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
