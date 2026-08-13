import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  Send,
  Sparkles,
  Target,
  Upload,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { JobRow, SubmissionRow } from "@/data/jobsApi";
import {
  applyToJob,
  getOrCreateMyProfile,
  listMyApplications,
  listOpenJobs,
  matchJobs,
  updateMyProfile,
  uploadMyResume,
  type CandidateProfile,
  type JobMatch,
} from "@/data/candidatePortal";

const stageTone: Record<string, string> = {
  Submitted: "bg-primary/10 text-primary border-primary/30",
  "Client review": "bg-accent/10 text-accent border-accent/30",
  Shortlisted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  Interview: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  Offer: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

const toList = (v: string) =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

const CandidatePortal = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [apps, setApps] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // editable form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    experience_years: "0",
    skills: "",
    preferred_roles: "",
    preferred_locations: "",
    expected_salary: "",
    notice_period: "",
    linkedin_url: "",
    portfolio_url: "",
  });

  const hydrate = useCallback((p: CandidateProfile) => {
    setProfile(p);
    setForm({
      full_name: p.full_name || "",
      email: p.email || "",
      phone: p.phone || "",
      location: p.location || "",
      headline: p.headline || "",
      summary: p.summary || "",
      experience_years: String(p.experience_years ?? 0),
      skills: (p.skills || []).join(", "),
      preferred_roles: (p.preferred_roles || []).join(", "),
      preferred_locations: (p.preferred_locations || []).join(", "),
      expected_salary: p.expected_salary || "",
      notice_period: p.notice_period || "",
      linkedin_url: p.linkedin_url || "",
      portfolio_url: p.portfolio_url || "",
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [p, j, a] = await Promise.all([
          getOrCreateMyProfile(),
          listOpenJobs().catch(() => []),
          listMyApplications().catch(() => []),
        ]);
        hydrate(p);
        setJobs(j);
        setApps(a);
      } catch (e) {
        toast({ title: "Could not load your portal", description: (e as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrate]);

  const appliedJobIds = useMemo(() => new Set(apps.map((a) => a.job_id)), [apps]);
  const matches: JobMatch[] = useMemo(() => matchJobs(jobs, profile), [jobs, profile]);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.location,
      profile.headline,
      profile.skills?.length,
      profile.experience_years > 0,
      profile.resume_url,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        headline: form.headline.trim() || null,
        summary: form.summary.trim() || null,
        experience_years: Number(form.experience_years) || 0,
        skills: toList(form.skills),
        preferred_roles: toList(form.preferred_roles),
        preferred_locations: toList(form.preferred_locations),
        expected_salary: form.expected_salary.trim() || null,
        notice_period: form.notice_period.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
      });
      hydrate(updated);
      toast({ title: "Profile updated" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleOpenToWork = async (open: boolean) => {
    try {
      const updated = await updateMyProfile({ open_to_work: open });
      setProfile(updated);
      toast({ title: open ? "You're open to work" : "Marked as not looking" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const onResume = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const updated = await uploadMyResume(file);
      setProfile(updated);
      toast({ title: "Resume updated", description: file.name });
    } catch (e) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const apply = async (m: JobMatch) => {
    if (!profile) return;
    if (!profile.resume_url) {
      toast({ title: "Upload a resume first", description: "Recruiters need your latest resume to review you.", variant: "destructive" });
      return;
    }
    setApplyingId(m.job.id);
    try {
      const row = await applyToJob(m.job, profile, m.score);
      setApps((prev) => [row, ...prev]);
      toast({ title: "Application sent", description: m.job.title });
    } catch (e) {
      toast({ title: "Could not apply", description: (e as Error).message, variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/candidate/signin", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-20 pointer-events-none" />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Glo<span className="gradient-text">hire</span>
            </span>
            <Badge variant="outline" className="ml-2 hidden sm:inline-flex">Candidate</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Hero summary */}
        <section className="rounded-2xl border border-border/60 p-6 md:p-8 shadow-elegant animate-fade-up" style={{ background: "var(--gradient-card)" }}>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display text-xl font-bold shadow-glow">
                {(profile?.full_name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {profile?.full_name || "Complete your profile"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.headline || "Add a headline so recruiters know your focus"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Open to work</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.open_to_work ? "Visible to recruiters" : "Hidden from matching"}
                </p>
              </div>
              <Switch checked={Boolean(profile?.open_to_work)} onCheckedChange={toggleOpenToWork} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Profile strength</p>
              <p className="font-display text-2xl font-bold">{completeness}%</p>
              <Progress value={completeness} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Applications</p>
              <p className="font-display text-2xl font-bold">{apps.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {apps.filter((a) => a.stage !== "Rejected").length} active
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Matched roles</p>
              <p className="font-display text-2xl font-bold">
                {matches.filter((m) => m.score >= 40).length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{jobs.length} open jobs scanned</p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="matches" className="animate-fade-up">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="matches"><Target className="h-4 w-4 mr-1.5" />Matched jobs</TabsTrigger>
            <TabsTrigger value="applications"><Briefcase className="h-4 w-4 mr-1.5" />My applications</TabsTrigger>
            <TabsTrigger value="profile"><UserRound className="h-4 w-4 mr-1.5" />Personal info</TabsTrigger>
            <TabsTrigger value="resume"><FileText className="h-4 w-4 mr-1.5" />Resume</TabsTrigger>
          </TabsList>

          {/* Matches */}
          <TabsContent value="matches" className="mt-6 space-y-4">
            {matches.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
                No open jobs right now. Check back soon.
              </CardContent></Card>
            )}
            {matches.map((m) => {
              const applied = appliedJobIds.has(m.job.id);
              return (
                <Card key={m.job.id} className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{m.job.title}</h3>
                        <Badge variant="outline">{m.job.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                        {m.job.client && <span>{m.job.client}</span>}
                        {m.job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{m.job.location}
                          </span>
                        )}
                        {m.job.employment_type && <span>{m.job.employment_type}</span>}
                        {m.job.experience && <span>{m.job.experience}</span>}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.matched.map((s) => (
                          <Badge key={s} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30" variant="outline">{s}</Badge>
                        ))}
                        {m.missing.slice(0, 6).map((s) => (
                          <Badge key={s} variant="outline" className="text-muted-foreground">{s}</Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{m.reason}</p>
                    </div>

                    <div className="flex md:flex-col items-center gap-3 md:w-40">
                      <div className="text-center">
                        <p className="font-display text-3xl font-bold gradient-text">{m.score}%</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">match</p>
                      </div>
                      <Button
                        variant={applied ? "outline" : "hero"}
                        size="sm"
                        className="w-full"
                        disabled={applied || applyingId === m.job.id}
                        onClick={() => apply(m)}
                      >
                        {applied ? (
                          <><CheckCircle2 className="h-4 w-4" />Applied</>
                        ) : applyingId === m.job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Send className="h-4 w-4" />Apply</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications" className="mt-6 space-y-4">
            {apps.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
                You haven't applied to any jobs yet.
              </CardContent></Card>
            )}
            {apps.map((a) => {
              const job = jobs.find((j) => j.id === a.job_id);
              return (
                <Card key={a.id}>
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                      <h3 className="font-semibold">{job?.title || "Job"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job?.client ? `${job.client} · ` : ""}Applied {new Date(a.created_at).toLocaleDateString()}
                      </p>
                      {a.stage === "Rejected" && a.reject_reason && (
                        <p className="mt-2 text-xs text-destructive">Feedback: {a.reject_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof a.score === "number" && (
                        <span className="text-sm text-muted-foreground">{a.score}% match</span>
                      )}
                      <Badge variant="outline" className={stageTone[a.stage] || ""}>{a.stage}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Personal info */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Keep this current — recruiters match on these details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                {([
                  ["full_name", "Full name", "Jane Doe"],
                  ["email", "Email", "you@email.com"],
                  ["phone", "Phone", "+1 555 000 1234"],
                  ["location", "Location", "Austin, TX"],
                  ["headline", "Headline", "Senior React Engineer"],
                  ["experience_years", "Years of experience", "6"],
                  ["expected_salary", "Expected salary", "$140k"],
                  ["notice_period", "Notice period", "30 days"],
                  ["linkedin_url", "LinkedIn", "https://linkedin.com/in/…"],
                  ["portfolio_url", "Portfolio", "https://…"],
                ] as const).map(([key, label, ph]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type={key === "experience_years" ? "number" : "text"}
                      value={form[key]}
                      placeholder={ph}
                      maxLength={255}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    value={form.skills}
                    placeholder="React, TypeScript, Node.js"
                    onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_roles">Preferred roles</Label>
                  <Input
                    id="preferred_roles"
                    value={form.preferred_roles}
                    placeholder="Frontend Engineer, Full-stack"
                    onChange={(e) => setForm((f) => ({ ...f, preferred_roles: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_locations">Preferred locations</Label>
                  <Input
                    id="preferred_locations"
                    value={form.preferred_locations}
                    placeholder="Remote, New York"
                    onChange={(e) => setForm((f) => ({ ...f, preferred_locations: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="summary">About you</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={form.summary}
                    maxLength={2000}
                    placeholder="A short summary of your experience and what you're looking for."
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button variant="hero" onClick={saveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume */}
          <TabsContent value="resume" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest resume</CardTitle>
                <CardDescription>Upload a new version any time — recruiters always see the newest one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {profile?.resume_url ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{profile.resume_filename || "Resume"}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {profile.resume_updated_at ? new Date(profile.resume_updated_at).toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.resume_url} target="_blank" rel="noreferrer">View</a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                )}

                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onResume(e.dataTransfer.files?.[0]);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 p-10 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => onResume(e.target.files?.[0])}
                  />
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading…" : "Drop your resume here or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX or TXT</p>
                </label>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CandidatePortal;
