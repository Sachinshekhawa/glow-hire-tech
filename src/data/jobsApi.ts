// Data access layer for jobs / submissions / interviews.
// Wraps the Supabase client with typed helpers used by the listing & detail pages.
import { supabase } from "@/integrations/supabase/client";

export type JobStatus = "Open" | "On hold" | "Closed" | "Assigned";
export type JobPriority = "High" | "Medium" | "Low";
export type SubmissionStage =
  | "Submitted"
  | "Client review"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Rejected";
export type InterviewMode = "Phone" | "Video" | "Onsite";
export type InterviewStatus =
  | "Scheduled"
  | "In progress"
  | "Completed"
  | "No-show"
  | "Rescheduled"
  | "Cancelled";

export type ScreeningQuestion = {
  category: "technical" | "behavioral" | "experience" | "culture";
  difficulty: "easy" | "medium" | "hard";
  question: string;
};

export type JobRow = {
  id: string;
  created_by: string;
  title: string;
  client: string | null;
  location: string | null;
  employment_type: string | null;
  priority: JobPriority;
  status: JobStatus;
  positions: number;
  filled: number;
  experience: string | null;
  skills: string[];
  salary: string | null;
  jd_markdown: string | null;
  source: string;
  answers: Record<string, unknown>;
  client_answers: Record<string, unknown>;
  ai_summary: string | null;
  ai_screening_questions: ScreeningQuestion[] | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionRow = {
  id: string;
  job_id: string;
  created_by: string;
  candidate_name: string;
  candidate_email: string | null;
  candidate_phone: string | null;
  resume_url: string | null;
  score: number | null;
  stage: SubmissionStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewRow = {
  id: string;
  job_id: string;
  submission_id: string | null;
  created_by: string;
  candidate_name: string;
  interviewer: string | null;
  scheduled_at: string;
  mode: InterviewMode;
  round: string | null;
  status: InterviewStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const listJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as JobRow[];
};

export const getJob = async (id: string) => {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as JobRow | null;
};

export const createJob = async (input: {
  title: string;
  client?: string | null;
  location?: string | null;
  employment_type?: string | null;
  priority?: JobPriority;
  status?: JobStatus;
  positions?: number;
  experience?: string | null;
  skills?: string[];
  salary?: string | null;
  jd_markdown?: string | null;
  source: "chat" | "prompt" | "upload";
  answers?: Record<string, unknown>;
  client_answers?: Record<string, unknown>;
}) => {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...input,
      created_by: uid,
      priority: input.priority ?? "Medium",
      status: input.status ?? "Open",
      positions: input.positions ?? 1,
      skills: input.skills ?? [],
      answers: input.answers ?? {},
      client_answers: input.client_answers ?? {},
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as JobRow;
};

export const updateJob = async (id: string, patch: Partial<JobRow>) => {
  const { data, error } = await supabase
    .from("jobs")
    .update(patch as any)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as JobRow;
};

export const deleteJob = async (id: string) => {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
};

export const listSubmissions = async (jobId: string) => {
  const { data, error } = await supabase
    .from("job_submissions")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as SubmissionRow[];
};

export const addSubmission = async (input: Omit<SubmissionRow, "id" | "created_at" | "updated_at" | "created_by">) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("job_submissions")
    .insert({ ...input, created_by: u.user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as SubmissionRow;
};

export const updateSubmissionStage = async (id: string, stage: SubmissionStage) => {
  const { error } = await supabase.from("job_submissions").update({ stage }).eq("id", id);
  if (error) throw error;
};

export const listInterviews = async (jobId: string) => {
  const { data, error } = await supabase
    .from("job_interviews")
    .select("*")
    .eq("job_id", jobId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data || []) as InterviewRow[];
};

export const addInterview = async (input: Omit<InterviewRow, "id" | "created_at" | "updated_at" | "created_by">) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("job_interviews")
    .insert({ ...input, created_by: u.user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as InterviewRow;
};
