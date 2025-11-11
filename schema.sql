create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- Mood table
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  date_iso date not null,
  mood text not null check (mood in ('sad','neutral','happy')),
  note text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mood_entries_user_date_idx on public.mood_entries (user_id, date_iso);
