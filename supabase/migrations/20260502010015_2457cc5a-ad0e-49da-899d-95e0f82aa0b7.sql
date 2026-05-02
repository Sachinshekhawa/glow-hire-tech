
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

drop policy if exists "submissions_update_authenticated" on public.job_submissions;
create policy "submissions_update_own" on public.job_submissions for update to authenticated
  using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "interviews_update_authenticated" on public.job_interviews;
create policy "interviews_update_own" on public.job_interviews for update to authenticated
  using (auth.uid() = created_by) with check (auth.uid() = created_by);
