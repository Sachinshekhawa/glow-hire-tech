import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  addInterview,
  addSubmission,
  getJob,
  listInterviews,
  listSubmissions,
  updateJob,
  updateSubmissionStage,
  type InterviewMode,
  type InterviewRow,
  type JobRow,
  type ScreeningQuestion,
  type SubmissionRow,
  type SubmissionStage,
} from "@/data/jobsApi";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STAGES: SubmissionStage[] = [
  "Submitted",
  "Client review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
];

const stageColor = (s: SubmissionStage): "default" | "primary" | "success" | "warning" | "error" => {
  if (s === "Offer") return "success";
  if (s === "Rejected") return "error";
  if (s === "Interview" || s === "Shortlisted") return "primary";
  if (s === "Client review") return "warning";
  return "default";
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "submissions" | "interviews" | "ai">("overview");

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);

  const [aiLoading, setAiLoading] = useState<"summary" | "questions" | null>(null);

  // Refresh helper
  const reload = async () => {
    if (!id) return;
    const [j, s, i] = await Promise.all([getJob(id), listSubmissions(id), listInterviews(id)]);
    setJob(j);
    setSubmissions(s);
    setInterviews(i);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getJob(id), listSubmissions(id), listInterviews(id)])
      .then(([j, s, i]) => {
        setJob(j);
        setSubmissions(s);
        setInterviews(i);
      })
      .catch((err) => {
        toast({ title: "Couldn't load job", description: err?.message || "Try again", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const callAi = async (mode: "summary" | "questions") => {
    if (!job) return;
    setAiLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke("job-ai", {
        body: {
          mode,
          title: job.title,
          jd: job.jd_markdown || "",
          skills: job.skills,
          experience: job.experience || "",
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      if (mode === "summary") {
        const summary = (data as any).summary || "";
        await updateJob(job.id, { ai_summary: summary } as any);
        setJob((prev) => (prev ? { ...prev, ai_summary: summary } : prev));
        toast({ title: "Summary generated", description: "AI summary saved to the job." });
      } else {
        const questions = ((data as any).questions || []) as ScreeningQuestion[];
        await updateJob(job.id, { ai_screening_questions: questions } as any);
        setJob((prev) => (prev ? { ...prev, ai_screening_questions: questions } : prev));
        toast({ title: `Generated ${questions.length} questions`, description: "Tailored to skills and experience." });
      }
    } catch (err: any) {
      toast({ title: "AI request failed", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const handleStageChange = async (sub: SubmissionRow, stage: SubmissionStage) => {
    try {
      await updateSubmissionStage(sub.id, stage);
      setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, stage } : s)));
    } catch (err: any) {
      toast({
        title: "Couldn't update stage",
        description: err?.message || "Only the recruiter who added this candidate can change it.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={120} sx={{ mt: 2, mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <Card sx={{ p: 6, textAlign: "center" }}>
          <h2 className="font-display text-xl font-semibold mb-2">Job not found</h2>
          <p className="text-sm text-muted-foreground mb-4">It may have been deleted or you don't have access.</p>
          <Button component={Link} to="/jobs" variant="outlined" startIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to jobs
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back link */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All jobs
      </Link>

      {/* Header card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Chip label={job.status} color="primary" size="small" />
                <Chip label={job.priority} size="small" variant="outlined" />
                {job.employment_type && <Chip label={job.employment_type} size="small" variant="outlined" />}
                <span className="text-xs text-muted-foreground">via {job.source}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {job.client && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.client}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {job.filled}/{job.positions} filled
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Created {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              {job.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Chip key={s} label={s} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outlined" startIcon={<UserPlus className="h-4 w-4" />} onClick={() => setSubmitOpen(true)}>
                Add submission
              </Button>
              <Button variant="contained" startIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => setInterviewOpen(true)}>
                Schedule interview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { textTransform: "none" } }}
      >
        <Tab value="overview" label="Overview" />
        <Tab value="submissions" label={`Submissions (${submissions.length})`} />
        <Tab value="interviews" label={`Interviews (${interviews.length})`} />
        <Tab value="ai" icon={<Sparkles className="h-3.5 w-3.5" />} iconPosition="start" label="AI Tasks" />
      </Tabs>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card sx={{ p: 3, gridColumn: { lg: "span 2" } }}>
            <h3 className="font-display text-base font-semibold mb-3">Job description</h3>
            {job.jd_markdown ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {job.jd_markdown}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No JD captured for this job.</p>
            )}
          </Card>
          <div className="space-y-4">
            <Card sx={{ p: 3 }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-base font-semibold">AI summary</h3>
                <Button size="small" startIcon={aiLoading === "summary" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} disabled={!!aiLoading} onClick={() => callAi("summary")}>
                  {job.ai_summary ? "Regenerate" : "Generate"}
                </Button>
              </div>
              {job.ai_summary ? (
                <p className="text-sm text-foreground/90 leading-relaxed">{job.ai_summary}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click Generate to create a recruiter-friendly summary from the JD.
                </p>
              )}
            </Card>
            <Card sx={{ p: 3 }}>
              <h3 className="font-display text-base font-semibold mb-2">Pipeline</h3>
              <ul className="text-sm space-y-1.5">
                <li className="flex justify-between"><span className="text-muted-foreground">Submissions</span><span>{submissions.length}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Interviews scheduled</span><span>{interviews.filter((i) => i.status === "Scheduled").length}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">In offer</span><span>{submissions.filter((s) => s.stage === "Offer").length}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Filled</span><span>{job.filled}/{job.positions}</span></li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "submissions" && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {submissions.length === 0 ? (
              <div className="p-10 text-center">
                <ListChecks className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No candidates submitted yet.</p>
                <Button variant="contained" startIcon={<UserPlus className="h-4 w-4" />} onClick={() => setSubmitOpen(true)}>
                  Add first submission
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {submissions.map((s) => (
                  <li key={s.id} className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{s.candidate_name}</p>
                        {s.score != null && (
                          <Chip label={`${s.score}%`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[s.candidate_email, s.candidate_phone].filter(Boolean).join(" · ")}
                        {s.notes && ` · ${s.notes}`}
                      </p>
                    </div>
                    <TextField
                      select
                      size="small"
                      value={s.stage}
                      onChange={(e) => handleStageChange(s, e.target.value as SubmissionStage)}
                      sx={{ minWidth: 160 }}
                    >
                      {STAGES.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Chip label={s.stage} color={stageColor(s.stage)} size="small" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "interviews" && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {interviews.length === 0 ? (
              <div className="p-10 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No interviews scheduled yet.</p>
                <Button variant="contained" startIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => setInterviewOpen(true)}>
                  Schedule one
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {interviews.map((iv) => (
                  <li key={iv.id} className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{iv.candidate_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDateTime(iv.scheduled_at)} · {iv.mode}
                        {iv.round && ` · ${iv.round}`}
                        {iv.interviewer && ` · with ${iv.interviewer}`}
                      </p>
                    </div>
                    <Chip label={iv.status} size="small" color={iv.status === "Completed" ? "success" : "primary"} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-base font-semibold">Job summary</h3>
                <p className="text-xs text-muted-foreground">A 4-6 sentence summary tailored for recruiters.</p>
              </div>
              <Button
                variant="contained"
                size="small"
                disabled={!!aiLoading}
                startIcon={aiLoading === "summary" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                onClick={() => callAi("summary")}
              >
                {job.ai_summary ? "Regenerate" : "Generate"}
              </Button>
            </div>
            {job.ai_summary ? (
              <p className="text-sm leading-relaxed text-foreground/90">{job.ai_summary}</p>
            ) : (
              <p className="text-xs text-muted-foreground">No summary yet — generate one to get started.</p>
            )}
          </Card>
          <Card sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-base font-semibold">Screening questions</h3>
                <p className="text-xs text-muted-foreground">
                  Tailored to {job.skills.length || 0} skill{job.skills.length === 1 ? "" : "s"}
                  {job.experience ? ` · ${job.experience}` : ""}.
                </p>
              </div>
              <Button
                variant="contained"
                size="small"
                disabled={!!aiLoading}
                startIcon={aiLoading === "questions" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                onClick={() => callAi("questions")}
              >
                {job.ai_screening_questions?.length ? "Regenerate" : "Generate"}
              </Button>
            </div>
            {job.ai_screening_questions?.length ? (
              <ol className="space-y-3">
                {job.ai_screening_questions.map((q, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                        {i + 1}
                      </span>
                      <Chip label={q.category} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                      <Chip label={q.difficulty} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    </div>
                    <p className="text-foreground/90 ml-7">{q.question}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">
                No questions yet — generate to get a 10-question screening pack.
              </p>
            )}
          </Card>
        </div>
      )}

      <AddSubmissionDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        jobId={job.id}
        onAdded={(s) => setSubmissions((prev) => [s, ...prev])}
      />

      <ScheduleInterviewDialog
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        jobId={job.id}
        submissions={submissions}
        onAdded={(iv) => setInterviews((prev) => [...prev, iv].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)))}
      />
    </DashboardLayout>
  );
};

const AddSubmissionDialog = ({
  open,
  onClose,
  jobId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onAdded: (s: SubmissionRow) => void;
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState("");
  const [score, setScore] = useState<string>("");
  const [stage, setStage] = useState<SubmissionStage>("Submitted");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setResume(""); setScore(""); setStage("Submitted"); setNotes("");
  };

  const submit = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const row = await addSubmission({
        job_id: jobId,
        candidate_name: name.trim(),
        candidate_email: email.trim() || null,
        candidate_phone: phone.trim() || null,
        resume_url: resume.trim() || null,
        score: score ? Math.max(0, Math.min(100, Number(score))) : null,
        stage,
        notes: notes.trim() || null,
      });
      onAdded(row);
      toast({ title: "Submission added" });
      reset();
      onClose();
    } catch (err: any) {
      toast({ title: "Couldn't add submission", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add submission</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <TextField label="Candidate name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <TextField label="Score (0-100)" type="number" value={score} onChange={(e) => setScore(e.target.value)} fullWidth />
          <TextField label="Resume URL" value={resume} onChange={(e) => setResume(e.target.value)} fullWidth sx={{ gridColumn: { sm: "span 2" } }} />
          <TextField select label="Stage" value={stage} onChange={(e) => setStage(e.target.value as SubmissionStage)} fullWidth>
            {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={2} sx={{ gridColumn: { sm: "span 2" } }} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Adding…" : "Add submission"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MODES: InterviewMode[] = ["Phone", "Video", "Onsite"];

const ScheduleInterviewDialog = ({
  open,
  onClose,
  jobId,
  submissions,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  submissions: SubmissionRow[];
  onAdded: (iv: InterviewRow) => void;
}) => {
  const { toast } = useToast();
  const [submissionId, setSubmissionId] = useState<string>("");
  const [candidate, setCandidate] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [mode, setMode] = useState<InterviewMode>("Video");
  const [round, setRound] = useState("Tech R1");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  // Pick candidate name from selected submission for convenience
  useEffect(() => {
    if (!submissionId) return;
    const s = submissions.find((x) => x.id === submissionId);
    if (s) setCandidate(s.candidate_name);
  }, [submissionId, submissions]);

  const submit = async () => {
    if (!candidate.trim()) {
      toast({ title: "Candidate required", variant: "destructive" });
      return;
    }
    if (!when) {
      toast({ title: "Pick a date & time", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const row = await addInterview({
        job_id: jobId,
        submission_id: submissionId || null,
        candidate_name: candidate.trim(),
        interviewer: interviewer.trim() || null,
        mode,
        round: round.trim() || null,
        scheduled_at: new Date(when).toISOString(),
        status: "Scheduled",
        notes: notes.trim() || null,
      });
      onAdded(row);
      toast({ title: "Interview scheduled" });
      onClose();
    } catch (err: any) {
      toast({ title: "Couldn't schedule", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Schedule interview</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <TextField select label="Linked submission" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} fullWidth sx={{ gridColumn: { sm: "span 2" } }}>
            <MenuItem value="">— Not linked —</MenuItem>
            {submissions.map((s) => <MenuItem key={s.id} value={s.id}>{s.candidate_name} · {s.stage}</MenuItem>)}
          </TextField>
          <TextField label="Candidate name" value={candidate} onChange={(e) => setCandidate(e.target.value)} required fullWidth />
          <TextField label="Interviewer" value={interviewer} onChange={(e) => setInterviewer(e.target.value)} fullWidth />
          <TextField
            label="Date & time"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as InterviewMode)} fullWidth>
            {MODES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField label="Round" value={round} onChange={(e) => setRound(e.target.value)} fullWidth sx={{ gridColumn: { sm: "span 2" } }} />
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={2} sx={{ gridColumn: { sm: "span 2" } }} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Scheduling…" : "Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetail;
