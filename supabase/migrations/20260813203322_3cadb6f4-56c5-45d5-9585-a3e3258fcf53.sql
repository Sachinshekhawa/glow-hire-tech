-- 1) Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'candidate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_roles_insert_candidate_self" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'candidate');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) Candidate profiles
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  location text,
  headline text,
  summary text,
  experience_years numeric NOT NULL DEFAULT 0,
  skills text[] NOT NULL DEFAULT '{}'::text[],
  open_to_work boolean NOT NULL DEFAULT true,
  preferred_roles text[] NOT NULL DEFAULT '{}'::text[],
  preferred_locations text[] NOT NULL DEFAULT '{}'::text[],
  expected_salary text,
  notice_period text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,
  resume_path text,
  resume_filename text,
  resume_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO service_role;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_select_own" ON public.candidate_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cp_insert_own" ON public.candidate_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp_update_own" ON public.candidate_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp_delete_own" ON public.candidate_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER candidate_profiles_touch
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) Candidates can browse open jobs
CREATE POLICY "jobs_select_open_for_candidates" ON public.jobs
  FOR SELECT TO authenticated
  USING (status IN ('Open', 'Assigned') AND public.has_role(auth.uid(), 'candidate'));

-- 4) Applications
ALTER TABLE public.job_submissions
  ADD COLUMN IF NOT EXISTS candidate_user_id uuid,
  ADD COLUMN IF NOT EXISTS applied_via text;

CREATE INDEX IF NOT EXISTS job_submissions_candidate_user_id_idx
  ON public.job_submissions (candidate_user_id);

CREATE POLICY "submissions_insert_candidate_self" ON public.job_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = candidate_user_id
    AND auth.uid() = created_by
    AND public.has_role(auth.uid(), 'candidate')
  );

CREATE POLICY "submissions_select_candidate_self" ON public.job_submissions
  FOR SELECT TO authenticated USING (auth.uid() = candidate_user_id);

CREATE POLICY "submissions_select_job_owner" ON public.job_submissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.created_by = auth.uid()));

CREATE POLICY "submissions_update_job_owner" ON public.job_submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.created_by = auth.uid()));

CREATE POLICY "submissions_delete_job_owner" ON public.job_submissions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.created_by = auth.uid()));