-- SmartHire AI — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  target_role text default 'AI Engineer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Resume analyses
create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  filename text,
  score numeric,
  skills jsonb default '[]'::jsonb,
  strengths jsonb default '[]'::jsonb,
  recommended_roles jsonb default '[]'::jsonb,
  ats_score numeric,
  ats_label text,
  created_at timestamptz default now()
);

alter table public.resume_analyses enable row level security;

create policy "Users can view own analyses"
  on public.resume_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.resume_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.resume_analyses for delete
  using (auth.uid() = user_id);

-- Saved jobs
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_title text not null,
  company text,
  location text,
  match_percent numeric,
  skills jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.saved_jobs enable row level security;

create policy "Users can view own saved jobs"
  on public.saved_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved jobs"
  on public.saved_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved jobs"
  on public.saved_jobs for delete
  using (auth.uid() = user_id);

-- Mentor chat history (optional)
create table if not exists public.mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user', 'ai')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.mentor_messages enable row level security;

create policy "Users can view own messages"
  on public.mentor_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.mentor_messages for insert
  with check (auth.uid() = user_id);
