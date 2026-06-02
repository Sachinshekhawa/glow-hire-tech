
DROP POLICY IF EXISTS candidates_select_authenticated ON public.candidates;
CREATE POLICY candidates_select_own ON public.candidates FOR SELECT TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS crv_select_authenticated ON public.candidate_resume_versions;
CREATE POLICY crv_select_own ON public.candidate_resume_versions FOR SELECT TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS submissions_select_authenticated ON public.job_submissions;
CREATE POLICY submissions_select_own ON public.job_submissions FOR SELECT TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS interviews_select_authenticated ON public.job_interviews;
CREATE POLICY interviews_select_own ON public.job_interviews FOR SELECT TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS jobs_select_authenticated ON public.jobs;
CREATE POLICY jobs_select_own ON public.jobs FOR SELECT TO authenticated USING (auth.uid() = created_by);
