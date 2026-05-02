
-- profiles (auto-created via trigger on signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- timestamps helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client text,
  location text,
  employment_type text,
  priority text not null default 'Medium',
  status text not null default 'Open',
  positions integer not null default 1,
  filled integer not null default 0,
  experience text,
  skills text[] not null default '{}',
  salary text,
  jd_markdown text,
  source text not null default 'chat',
  answers jsonb not null default '{}'::jsonb,
  client_answers jsonb not null default '{}'::jsonb,
  ai_summary text,
  ai_screening_questions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_created_by_idx on public.jobs(created_by);
create index jobs_status_idx on public.jobs(status);
alter table public.jobs enable row level security;
create policy "jobs_select_authenticated" on public.jobs for select to authenticated using (true);
create policy "jobs_insert_own" on public.jobs for insert to authenticated with check (auth.uid() = created_by);
create policy "jobs_update_own" on public.jobs for update to authenticated using (auth.uid() = created_by);
create policy "jobs_delete_own" on public.jobs for delete to authenticated using (auth.uid() = created_by);
create trigger jobs_touch before update on public.jobs for each row execute function public.touch_updated_at();

-- submissions
create table public.job_submissions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  candidate_name text not null,
  candidate_email text,
  candidate_phone text,
  resume_url text,
  score integer,
  stage text not null default 'Submitted',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_submissions_job_idx on public.job_submissions(job_id);
alter table public.job_submissions enable row level security;
create policy "submissions_select_authenticated" on public.job_submissions for select to authenticated using (true);
create policy "submissions_insert_authenticated" on public.job_submissions for insert to authenticated with check (auth.uid() = created_by);
create policy "submissions_update_authenticated" on public.job_submissions for update to authenticated using (true);
create policy "submissions_delete_own" on public.job_submissions for delete to authenticated using (auth.uid() = created_by);
create trigger submissions_touch before update on public.job_submissions for each row execute function public.touch_updated_at();

-- interviews
create table public.job_interviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  submission_id uuid references public.job_submissions(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  candidate_name text not null,
  interviewer text,
  scheduled_at timestamptz not null,
  mode text not null default 'Video',
  round text,
  status text not null default 'Scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_interviews_job_idx on public.job_interviews(job_id);
create index job_interviews_when_idx on public.job_interviews(scheduled_at);
alter table public.job_interviews enable row level security;
create policy "interviews_select_authenticated" on public.job_interviews for select to authenticated using (true);
create policy "interviews_insert_authenticated" on public.job_interviews for insert to authenticated with check (auth.uid() = created_by);
create policy "interviews_update_authenticated" on public.job_interviews for update to authenticated using (true);
create policy "interviews_delete_own" on public.job_interviews for delete to authenticated using (auth.uid() = created_by);
create trigger interviews_touch before update on public.job_interviews for each row execute function public.touch_updated_at();
