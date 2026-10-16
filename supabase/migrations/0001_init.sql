-- Jimmy Shimwa portfolio: initial schema.
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Public visitors can read published content. Only the admin can write.

create extension if not exists pgcrypto;

-- The single admin. Writes are allowed only for the signed-in user whose
-- email is listed here. Insert Jimmy's email once (see README).
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies: nobody can read or change this table through the API.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
-- Keep "Confirm email" switched on in Supabase Auth, so nobody gets a
-- session for the admin email without access to that inbox.

-- Profile: a single row with id = 1.
create table if not exists public.profile (
  id smallint primary key default 1 check (id = 1),
  name text not null,
  location text not null,
  email text not null,
  github text not null default '',
  linkedin text not null default '',
  x text not null default '',
  cv_url text not null default '',
  avatar_url text not null default '',
  avatar_alt text not null default '',
  years_experience int not null default 0,
  project_count int not null default 0,
  hats jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  url text,
  start_date date not null,
  end_date date,
  current boolean not null default false,
  description jsonb not null,
  sort_order int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  body text not null default '',
  cover_url text,
  cover_alt text,
  roles jsonb not null,
  stack text[] not null default '{}',
  links jsonb not null default '[]',
  year int not null,
  featured boolean not null default true,
  sort_order jsonb not null default '{"founder":0,"engineer":0,"pm":0}',
  published boolean not null default false,
  line_move text not null default 'coil'
    check (line_move in ('coil','frame','knot','write','steps')),
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now(),
  -- Alt text is required whenever there is a cover image.
  check (cover_url is null or coalesce(length(trim(cover_alt)), 0) > 0)
);

create table if not exists public.also_shipped (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null default '',
  url text,
  status text not null default 'shipped' check (status in ('shipped','finished')),
  sort_order int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.line_messages (
  id uuid primary key default gen_random_uuid(),
  trigger text not null check (trigger in ('hello','idle','fast','end')),
  hat text check (hat in ('founder','engineer','pm')),
  time_of_day text check (time_of_day in ('dawn','day','dusk','night')),
  text text not null check (length(text) between 1 and 80),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.clock_statuses (
  id uuid primary key default gen_random_uuid(),
  start_hour int not null check (start_hour between 0 and 23),
  end_hour int not null check (end_hour between 1 and 24 and end_hour > start_hour),
  text text not null check (length(text) between 1 and 80),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  alt text not null check (length(trim(alt)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  email text not null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

-- Row level security ------------------------------------------------------
alter table public.profile enable row level security;
alter table public.positions enable row level security;
alter table public.projects enable row level security;
alter table public.also_shipped enable row level security;
alter table public.line_messages enable row level security;
alter table public.clock_statuses enable row level security;
alter table public.media enable row level security;
alter table public.admin_log enable row level security;

-- Public reads.
create policy "public read profile" on public.profile for select using (true);
create policy "public read positions" on public.positions for select using (visible or public.is_admin());
create policy "public read projects" on public.projects for select using (published or public.is_admin());
create policy "public read also_shipped" on public.also_shipped for select using (visible or public.is_admin());
create policy "public read line_messages" on public.line_messages for select using (active or public.is_admin());
create policy "public read clock_statuses" on public.clock_statuses for select using (true);
create policy "public read media" on public.media for select using (true);

-- Admin writes.
create policy "admin write profile" on public.profile for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write positions" on public.positions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write also_shipped" on public.also_shipped for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write line_messages" on public.line_messages for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write clock_statuses" on public.clock_statuses for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write media" on public.media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read log" on public.admin_log for select using (public.is_admin());
create policy "admin append log" on public.admin_log for insert with check (public.is_admin());

-- Storage: a public bucket for images. Only the admin can upload or delete.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media bucket" on storage.objects
  for select using (bucket_id = 'media');
create policy "admin insert media bucket" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media bucket" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media bucket" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
