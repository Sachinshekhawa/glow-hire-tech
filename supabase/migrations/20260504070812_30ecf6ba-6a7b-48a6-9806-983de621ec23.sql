
-- 1. Reject reason on submissions
ALTER TABLE public.job_submissions
  ADD COLUMN IF NOT EXISTS reject_reason text,
  ADD COLUMN IF NOT EXISTS reject_reason_color text;

-- 2. Candidates library
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  resume_url text NOT NULL,
  resume_filename text,
  resume_path text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidates_select_authenticated" ON public.candidates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "candidates_insert_own" ON public.candidates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "candidates_update_own" ON public.candidates
  FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "candidates_delete_own" ON public.candidates
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TRIGGER candidates_touch_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Resumes storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can manage files only inside their own user-id folder
CREATE POLICY "resumes_select_own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
