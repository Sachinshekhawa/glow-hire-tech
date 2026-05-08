// Resume Intelligence — versioning, parsing, AI compare
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/lib/jdFileParser";

export type ResumeChange = {
  category:
    | "skill" | "experience" | "company" | "designation" | "promotion"
    | "responsibility" | "project" | "education" | "certification"
    | "timeline" | "location" | "contact";
  type: "added" | "removed" | "modified";
  detail: string;
};

export type ParsedResume = {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  total_experience_years?: number;
  skills?: string[];
  experience?: Array<{
    company?: string; title?: string; start?: string; end?: string;
    location?: string; responsibilities?: string[];
  }>;
  projects?: Array<{ name?: string; description?: string; tech?: string[] }>;
  education?: Array<{ institution?: string; degree?: string; year?: string }>;
  certifications?: string[];
};

export type LatestChanges = { headline: string; changes: ResumeChange[] };
export type EvolutionSummary = {
  headline: string;
  experience_growth?: string;
  career_growth?: string;
  technology_evolution?: string;
  company_progression?: string;
  leadership_growth?: string;
};

export type ResumeVersionRow = {
  id: string;
  candidate_id: string;
  created_by: string;
  version: number;
  resume_url: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  raw_text: string | null;
  parsed: ParsedResume;
  summary: string | null;
  latest_changes: LatestChanges;
  evolution_summary: EvolutionSummary;
  created_at: string;
  updated_at: string;
};

export const listResumeVersions = async (candidateId: string) => {
  const { data, error } = await supabase
    .from("candidate_resume_versions")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ResumeVersionRow[];
};

const callIntel = async (raw_text: string, prior: ResumeVersionRow[]) => {
  const { data, error } = await supabase.functions.invoke("resume-intel", {
    body: {
      raw_text,
      prior: prior.map((p) => ({ version: p.version, parsed: p.parsed, summary: p.summary })),
    },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as {
    parsed: ParsedResume;
    summary: string;
    latest_changes: LatestChanges;
    evolution_summary: EvolutionSummary;
  };
};

/**
 * Upload a new resume for an EXISTING candidate, create a new numbered version,
 * parse + run AI comparison against all prior versions.
 */
export const addResumeVersion = async (candidateId: string, file: File) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const uid = u.user.id;

  // 1. Upload file to storage
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${uid}/${candidateId}/${Date.now()}_${safeName}`;
  const { error: upErr } = await supabase.storage
    .from("resumes")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (upErr) throw upErr;
  const { data: signed } = await supabase.storage.from("resumes").createSignedUrl(path, 60 * 60 * 24 * 7);
  const url = signed?.signedUrl || "";

  // 2. Extract text
  let raw_text = "";
  try {
    const r = await extractTextFromFile(file);
    raw_text = r.text;
  } catch {
    raw_text = "";
  }

  // 3. Load prior versions
  const prior = await listResumeVersions(candidateId);
  const nextVersion = (prior[0]?.version ?? 0) + 1;

  // 4. AI intel (best-effort)
  let intel: Awaited<ReturnType<typeof callIntel>> | null = null;
  if (raw_text) {
    try {
      intel = await callIntel(raw_text, prior);
    } catch (e) {
      console.warn("resume-intel failed", e);
    }
  }

  // 5. Insert version row
  const { data, error } = await supabase
    .from("candidate_resume_versions")
    .insert({
      candidate_id: candidateId,
      created_by: uid,
      version: nextVersion,
      resume_url: url,
      resume_path: path,
      resume_filename: file.name,
      raw_text,
      parsed: (intel?.parsed ?? {}) as any,
      summary: intel?.summary ?? null,
      latest_changes: (intel?.latest_changes ?? { headline: prior.length === 0 ? "Initial resume." : "AI analysis unavailable.", changes: [] }) as any,
      evolution_summary: (intel?.evolution_summary ?? { headline: prior.length === 0 ? "First version on file." : "AI analysis unavailable." }) as any,
    })
    .select("*")
    .single();
  if (error) throw error;

  // 6. Update candidate's headline resume to the latest
  await supabase
    .from("candidates")
    .update({ resume_url: url, resume_path: path, resume_filename: file.name })
    .eq("id", candidateId);

  return data as unknown as ResumeVersionRow;
};
