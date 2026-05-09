import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, FileText, Loader2, ExternalLink, Sparkles,
  GitCompare, Plus, Minus, Pencil, Clock, TrendingUp, AlertTriangle, Info, ShieldAlert, Briefcase, ArrowRight,
} from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getCandidate, refreshResumeUrl, type CandidateRow } from "@/data/jobsApi";
import {
  listResumeVersions, addResumeVersion,
  type ResumeVersionRow, type ResumeChange, type FitmentFlag,
} from "@/data/resumeIntel";
import { useToast } from "@/hooks/use-toast";

const ACCEPT = ".pdf,.doc,.docx,.txt,.rtf";

const changeColor = (t: ResumeChange["type"]) =>
  t === "added"
    ? { bg: "hsl(142 71% 45% / 0.12)", fg: "hsl(142 71% 35%)", border: "hsl(142 71% 45% / 0.4)", icon: <Plus className="h-3 w-3" /> }
    : t === "removed"
      ? { bg: "hsl(0 72% 55% / 0.12)", fg: "hsl(0 72% 45%)", border: "hsl(0 72% 55% / 0.4)", icon: <Minus className="h-3 w-3" /> }
      : { bg: "hsl(45 93% 50% / 0.15)", fg: "hsl(38 92% 35%)", border: "hsl(45 93% 50% / 0.4)", icon: <Pencil className="h-3 w-3" /> };

const ChangeChip = ({ c }: { c: ResumeChange }) => {
  const col = changeColor(c.type);
  return (
    <div
      className="flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs"
      style={{ background: col.bg, borderColor: col.border, color: col.fg }}
    >
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: col.fg + "22" }}>
        {col.icon}
      </span>
      <span className="leading-snug">
        <span className="font-semibold capitalize">{c.category}</span> · {c.detail}
      </span>
    </div>
  );
};

const ParsedView = ({ p }: { p: ResumeVersionRow["parsed"] }) => (
  <div className="space-y-3 text-sm">
    {p.headline && <p className="text-muted-foreground italic">{p.headline}</p>}
    {p.skills?.length ? (
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Skills</p>
        <div className="flex flex-wrap gap-1">
          {p.skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" />)}
        </div>
      </div>
    ) : null}
    {p.experience?.length ? (
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Experience</p>
        <ul className="space-y-1.5">
          {p.experience.map((e, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium">{e.title || "—"}</span>
              {e.company ? <span className="text-muted-foreground"> @ {e.company}</span> : null}
              {(e.start || e.end) && <span className="text-xs text-muted-foreground"> · {e.start || "?"} → {e.end || "Present"}</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : null}
    {p.education?.length ? (
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Education</p>
        <ul className="text-sm space-y-1">
          {p.education.map((e, i) => (
            <li key={i}>{[e.degree, e.institution, e.year].filter(Boolean).join(" · ")}</li>
          ))}
        </ul>
      </div>
    ) : null}
    {p.certifications?.length ? (
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Certifications</p>
        <div className="flex flex-wrap gap-1">
          {p.certifications.map((c) => <Chip key={c} label={c} size="small" />)}
        </div>
      </div>
    ) : null}
  </div>
);

const CandidateDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<CandidateRow | null>(null);
  const [versions, setVersions] = useState<ResumeVersionRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareWithId, setCompareWithId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!id) return;
    const [c, v] = await Promise.all([getCandidate(id), listResumeVersions(id)]);
    setCandidate(c);
    setVersions(v);
    if (v.length) {
      setSelectedVersionId((prev) => prev ?? v[0].id);
      setCompareWithId((prev) => prev ?? (v[1]?.id || v[0].id));
    }
  };

  useEffect(() => { load().catch((e) => toast({ title: "Couldn't load candidate", description: e?.message, variant: "destructive" })); }, [id]);

  const handleFile = async (f: File | undefined | null) => {
    if (!f || !id) return;
    setUploading(true);
    try {
      const v = await addResumeVersion(id, f);
      toast({ title: `Uploaded V${v.version}`, description: "AI analysis complete." });
      await load();
      setSelectedVersionId(v.id);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openResume = async (v: ResumeVersionRow) => {
    let url = v.resume_url || "";
    if (v.resume_path) {
      const fresh = await refreshResumeUrl(v.resume_path);
      if (fresh) url = fresh;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const selected = versions?.find((v) => v.id === selectedVersionId) || null;
  const compareWith = versions?.find((v) => v.id === compareWithId) || null;

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link to="/candidates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to candidates
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {candidate?.full_name || <Skeleton width={200} />}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {versions?.length ? `${versions.length} resume version${versions.length === 1 ? "" : "s"} on file` : "Loading…"}
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Analyzing…" : "Upload new resume"}
        </Button>
        <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      {versions && versions.length > 0 && (() => {
        const latest = versions[0];
        const p = latest.parsed || {};
        const detail = (label: string, value?: string | number | null) =>
          value ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-sm mt-0.5">{value}</p>
            </div>
          ) : null;
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Candidate details</h2>
                <Chip label={`From V${latest.version}`} size="small" sx={{ ml: 1 }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {detail("Full name", p.full_name || candidate?.full_name)}
                {detail("Email", p.email || candidate?.email)}
                {detail("Phone", p.phone || candidate?.phone)}
                {detail("Location", p.location)}
                {detail("Total experience", p.total_experience_years ? `${p.total_experience_years} yrs` : undefined)}
                {detail("Headline", p.headline)}
              </div>
              <ParsedView p={p} />
              {p.projects?.length ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Projects</p>
                  <ul className="space-y-1.5 text-sm">
                    {p.projects.map((pr, i) => (
                      <li key={i}>
                        <span className="font-medium">{pr.name || "—"}</span>
                        {pr.description ? <span className="text-muted-foreground"> · {pr.description}</span> : null}
                        {pr.tech?.length ? <span className="text-xs text-muted-foreground"> [{pr.tech.join(", ")}]</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })()}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Resume Intelligence</h2>
          </div>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
            <Tab label="Timeline" />
            <Tab label="Career trajectory" />
            <Tab label="Latest changes" />
            <Tab label="Career evolution" />
            <Tab label="Side-by-side" />
          </Tabs>

          {versions === null ? (
            <Skeleton variant="rounded" height={120} />
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resume versions yet. Upload a resume to begin.</p>
          ) : tab === 0 ? (
            // Timeline
            <div className="space-y-3">
              {versions.map((v, i) => (
                <div key={v.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} font-semibold text-xs`}>
                      V{v.version}
                    </div>
                    {i < versions.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <Card variant="outlined" sx={{ flex: 1, mb: 1 }}>
                    <CardContent>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{v.resume_filename || `Version ${v.version}`}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {new Date(v.created_at).toLocaleString()}
                          </p>
                        </div>
                        <IconButton size="small" onClick={() => openResume(v)} title="Open resume">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                      {v.summary && <p className="text-sm">{v.summary}</p>}
                      {v.latest_changes?.changes?.length ? (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {v.latest_changes.changes.slice(0, 6).map((c, idx) => <ChangeChip key={idx} c={c} />)}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : tab === 1 ? (
            // Career trajectory
            (() => {
              const ct = versions[0].evolution_summary?.career_trajectory;
              if (!ct || (!ct.timeline?.length && !ct.fitment_flags?.length)) {
                return <p className="text-sm text-muted-foreground">Trajectory analysis not available yet. Upload a resume to generate it.</p>;
              }
              const flagStyle = (s: FitmentFlag["severity"]) =>
                s === "critical" ? { bg: "hsl(0 72% 55% / 0.1)", fg: "hsl(0 72% 40%)", border: "hsl(0 72% 55% / 0.4)", icon: <ShieldAlert className="h-4 w-4" /> }
                  : s === "warning" ? { bg: "hsl(38 92% 50% / 0.12)", fg: "hsl(28 90% 35%)", border: "hsl(38 92% 50% / 0.4)", icon: <AlertTriangle className="h-4 w-4" /> }
                    : { bg: "hsl(210 90% 55% / 0.1)", fg: "hsl(210 90% 40%)", border: "hsl(210 90% 55% / 0.4)", icon: <Info className="h-4 w-4" /> };
              const fmtMonths = (m?: number) => {
                if (!m && m !== 0) return "—";
                if (m < 12) return `${m} mo`;
                const y = Math.floor(m / 12); const r = m % 12;
                return r ? `${y}y ${r}m` : `${y}y`;
              };
              return (
                <div className="space-y-4">
                  {/* Current role + stability */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ct.current_role && (
                      <Card variant="outlined" sx={{ gridColumn: { md: "span 2" } }}>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current role</p>
                          </div>
                          <p className="font-semibold text-base">
                            {ct.current_role.title}{ct.current_role.company ? ` @ ${ct.current_role.company}` : ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                            {ct.current_role.domain && <Chip size="small" label={ct.current_role.domain} color="primary" variant="outlined" />}
                            <span className="text-muted-foreground inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {fmtMonths(ct.current_role.tenure_months)} in role
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {typeof ct.stability_score === "number" && (
                      <Card variant="outlined">
                        <CardContent>
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Stability score</p>
                          </div>
                          <p className="font-display text-2xl font-bold">{Math.round(ct.stability_score)}<span className="text-sm text-muted-foreground">/100</span></p>
                          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, ct.stability_score))}%` }} />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Fitment flags */}
                  {ct.fitment_flags?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Fitment signals</p>
                      {ct.fitment_flags.map((f, i) => {
                        const s = flagStyle(f.severity);
                        return (
                          <div key={i} className="flex items-start gap-2 rounded-md border p-3 text-sm" style={{ background: s.bg, borderColor: s.border, color: s.fg }}>
                            <span className="mt-0.5">{s.icon}</span>
                            <span><span className="font-semibold capitalize">{f.severity}:</span> {f.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Domain shifts */}
                  {ct.domain_shifts?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Domain transitions</p>
                      <div className="space-y-2">
                        {ct.domain_shifts.map((d, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border p-2.5 text-sm bg-muted/30">
                            <Chip size="small" label={d.from_domain || "?"} variant="outlined" />
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <Chip size="small" label={d.to_domain || "?"} color="primary" />
                            <span className="text-muted-foreground text-xs">
                              {d.at_company ? `at ${d.at_company} · ` : ""}{fmtMonths(d.tenure_in_new_role_months)} in new role
                            </span>
                            {d.note && <span className="basis-full text-xs text-muted-foreground">{d.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Job timeline */}
                  {ct.timeline?.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Job timeline</p>
                      <div className="space-y-2">
                        {ct.timeline.map((t, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-2.5 w-2.5 rounded-full ${t.is_transition ? "bg-amber-500" : "bg-primary"}`} />
                              {i < (ct.timeline?.length || 0) - 1 && <div className="w-px flex-1 bg-border my-1" />}
                            </div>
                            <div className="flex-1 rounded-md border p-3">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-medium text-sm">
                                  {t.title}{t.company ? <span className="text-muted-foreground"> @ {t.company}</span> : null}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {t.start || "?"} → {t.end || "Present"} · {fmtMonths(t.duration_months)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {t.domain && <Chip size="small" label={t.domain} variant="outlined" color={t.is_transition ? "warning" : "default"} />}
                                {t.tech_focus?.slice(0, 6).map((x) => <Chip key={x} size="small" label={x} />)}
                              </div>
                              {t.transition_note && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 inline-flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> {t.transition_note}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : tab === 2 ? (
            // Latest changes for the selected version
            <div className="space-y-3">
              <TextField select size="small" label="Version" value={selectedVersionId || ""} onChange={(e) => setSelectedVersionId(e.target.value)} sx={{ minWidth: 200 }}>
                {versions.map((v) => <MenuItem key={v.id} value={v.id}>V{v.version} — {new Date(v.created_at).toLocaleDateString()}</MenuItem>)}
              </TextField>
              {selected && (
                <>
                  <p className="text-sm font-medium">{selected.latest_changes?.headline}</p>
                  {selected.latest_changes?.changes?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selected.latest_changes.changes.map((c, i) => <ChangeChip key={i} c={c} />)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No itemised changes detected.</p>
                  )}
                </>
              )}
            </div>
          ) : tab === 3 ? (
            // Career evolution from the latest version
            <div className="space-y-3 text-sm">
              {(() => {
                const latest = versions[0];
                const ev = latest.evolution_summary || ({} as any);
                const rows: Array<[string, string | undefined]> = [
                  ["Headline", ev.headline],
                  ["Experience growth", ev.experience_growth],
                  ["Career growth", ev.career_growth],
                  ["Technology evolution", ev.technology_evolution],
                  ["Company progression", ev.company_progression],
                  ["Leadership growth", ev.leadership_growth],
                ];
                return rows.filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="rounded-md border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                    <p className="mt-1">{v}</p>
                  </div>
                ));
              })()}
            </div>
          ) : (
            // Side-by-side
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <TextField select size="small" label="Compare" value={selectedVersionId || ""} onChange={(e) => setSelectedVersionId(e.target.value)} sx={{ minWidth: 180 }}>
                  {versions.map((v) => <MenuItem key={v.id} value={v.id}>V{v.version}</MenuItem>)}
                </TextField>
                <div className="flex items-center text-muted-foreground"><GitCompare className="h-4 w-4" /></div>
                <TextField select size="small" label="With" value={compareWithId || ""} onChange={(e) => setCompareWithId(e.target.value)} sx={{ minWidth: 180 }}>
                  {versions.map((v) => <MenuItem key={v.id} value={v.id}>V{v.version}</MenuItem>)}
                </TextField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[selected, compareWith].map((v, i) => v && (
                  <Card key={i} variant="outlined">
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">V{v.version}</p>
                        <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                      </div>
                      {v.summary && <p className="text-sm text-muted-foreground mb-3">{v.summary}</p>}
                      <ParsedView p={v.parsed} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CandidateDetail;
