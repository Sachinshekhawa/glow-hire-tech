
CREATE TABLE public.candidate_resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  version int NOT NULL,
  resume_url text,
  resume_path text,
  resume_filename text,
  raw_text text,
  parsed jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  latest_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  evolution_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, version)
);

CREATE INDEX idx_crv_candidate ON public.candidate_resume_versions(candidate_id, version DESC);

ALTER TABLE public.candidate_resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crv_select_authenticated" ON public.candidate_resume_versions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "crv_insert_own" ON public.candidate_resume_versions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "crv_update_own" ON public.candidate_resume_versions
  FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "crv_delete_own" ON public.candidate_resume_versions
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TRIGGER trg_crv_touch BEFORE UPDATE ON public.candidate_resume_versions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
