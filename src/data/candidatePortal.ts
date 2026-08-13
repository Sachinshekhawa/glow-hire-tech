// Data access layer for the public candidate portal.
import { supabase } from "@/integrations/supabase/client";
import type { JobRow, SubmissionRow } from "@/data/jobsApi";

export type CandidateProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  experience_years: number;
  skills: string[];
  open_to_work: boolean;
  preferred_roles: string[];
  preferred_locations: string[];
  expected_salary: string | null;
  notice_period: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  resume_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user;
};

/** Make sure the signed-in user is tagged as a candidate (idempotent). */
export const ensureCandidateRole = async () => {
  const user = await requireUser();
  const { data } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "candidate")
    .maybeSingle();
  if (data) return;
  await supabase.from("user_roles").insert({ user_id: user.id, role: "candidate" });
};

export const isCandidate = async () => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", u.user.id)
    .eq("role", "candidate")
    .maybeSingle();
  return Boolean(data);
};

export const getMyProfile = async () => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as CandidateProfile | null;
};

/** Fetch the profile, creating an empty one on first visit. */
export const getOrCreateMyProfile = async () => {
  const existing = await getMyProfile();
  if (existing) return existing;
  const user = await requireUser();
  const { data, error } = await supabase
    .from("candidate_profiles")
    .insert({
      user_id: user.id,
      full_name: (user.user_metadata?.full_name as string) || "",
      email: user.email ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as CandidateProfile;
};

export const updateMyProfile = async (patch: Partial<CandidateProfile>) => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("candidate_profiles")
    .update(patch as never)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) throw error;
  return data as CandidateProfile;
};

/** Upload a new resume to private storage and attach it to the profile. */
export const uploadMyResume = async (file: File) => {
  const user = await requireUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${user.id}/${Date.now()}_${safeName}`;
  const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;
  const { data: signed } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return updateMyProfile({
    resume_url: signed?.signedUrl || "",
    resume_path: path,
    resume_filename: file.name,
    resume_updated_at: new Date().toISOString(),
  });
};

/** Jobs the candidate is allowed to browse (open / assigned). */
export const listOpenJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .in("status", ["Open", "Assigned"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as JobRow[];
};

export const listMyApplications = async () => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("job_submissions")
    .select("*")
    .eq("candidate_user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as SubmissionRow[];
};

export const applyToJob = async (job: JobRow, profile: CandidateProfile, score: number) => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("job_submissions")
    .insert({
      job_id: job.id,
      created_by: user.id,
      candidate_user_id: user.id,
      candidate_name: profile.full_name || user.email || "Candidate",
      candidate_email: profile.email ?? user.email ?? null,
      candidate_phone: profile.phone,
      resume_url: profile.resume_url,
      score,
      stage: "Submitted",
      applied_via: "portal",
      notes: profile.headline,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as SubmissionRow;
};

// ---------- Skill-overlap matching ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.]/g, "");

const yearsFromText = (text?: string | null) => {
  if (!text) return 0;
  const m = text.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
};

export type JobMatch = {
  job: JobRow;
  score: number;
  matched: string[];
  missing: string[];
  reason: string;
};

/** Simple deterministic match: skill overlap (80%) + experience fit (20%). */
export const matchJobs = (jobs: JobRow[], profile: CandidateProfile | null): JobMatch[] => {
  const mySkills = (profile?.skills || []).map(norm).filter(Boolean);
  return jobs
    .map((job) => {
      const jobSkills = (job.skills || []).filter(Boolean);
      const matched = jobSkills.filter((s) => mySkills.includes(norm(s)));
      const missing = jobSkills.filter((s) => !mySkills.includes(norm(s)));
      const skillScore = jobSkills.length ? matched.length / jobSkills.length : mySkills.length ? 0.4 : 0;

      const needed = yearsFromText(job.experience);
      const mine = Number(profile?.experience_years || 0);
      const expScore = needed <= 0 ? 0.6 : Math.max(0, Math.min(1, mine / needed));

      const score = Math.round((skillScore * 0.8 + expScore * 0.2) * 100);
      const reason = jobSkills.length
        ? `${matched.length}/${jobSkills.length} required skills matched`
        : "No skills listed on this job";
      return { job, score, matched, missing, reason };
    })
    .sort((a, b) => b.score - a.score);
};
