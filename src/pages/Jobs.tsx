import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Search, Plus, MapPin, Users, Clock, Sparkles } from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { listJobs, type JobRow, type JobStatus } from "@/data/jobsApi";
import { useToast } from "@/hooks/use-toast";

const STATUS_FILTERS: ("All" | JobStatus)[] = ["All", "Open", "Assigned", "On hold", "Closed"];

const statusColor = (s: JobStatus): "success" | "primary" | "warning" | "default" => {
  if (s === "Open") return "success";
  if (s === "Assigned") return "primary";
  if (s === "On hold") return "warning";
  return "default";
};

const priorityColor = (p: string): "error" | "warning" | "default" => {
  if (p === "High") return "error";
  if (p === "Medium") return "warning";
  return "default";
};

const ageOf = (iso: string) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
};

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [filter, setFilter] = useState<"All" | JobStatus>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((err) => {
        toast({ title: "Couldn't load jobs", description: err?.message || "Try again", variant: "destructive" });
        setJobs([]);
      });
  }, [toast]);

  const visible = useMemo(() => {
    if (!jobs) return [];
    let out = jobs;
    if (filter === "All") {
      out = out.filter((j) => j.status === "Open" || j.status === "Assigned");
    } else {
      out = out.filter((j) => j.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.client || "").toLowerCase().includes(q) ||
          (j.location || "").toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return out;
  }, [jobs, filter, query]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">All active and assigned jobs in your workspace.</p>
        </div>
        <Button
          component={Link}
          to="/create-job"
          variant="contained"
          color="primary"
          startIcon={<Plus className="h-4 w-4" />}
        >
          New job
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ToggleButtonGroup
          value={filter}
          exclusive
          size="small"
          onChange={(_, v) => v && setFilter(v)}
          sx={{ flexWrap: "wrap" }}
        >
          {STATUS_FILTERS.map((s) => (
            <ToggleButton key={s} value={s} sx={{ textTransform: "none", px: 2 }}>
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="relative flex items-center min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <InputBase
            placeholder="Search by title, client, skill…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              width: "100%",
              pl: 5,
              pr: 2,
              height: 38,
              borderRadius: 2,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--muted) / 0.4)",
              fontSize: 14,
            }}
          />
        </div>
      </div>

      {/* List */}
      {jobs === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={180} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center" }}>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">No jobs yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first job and it'll appear here instantly.
          </p>
          <Button component={Link} to="/create-job" variant="contained" startIcon={<Sparkles className="h-4 w-4" />}>
            Create a job
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((job) => {
            const fillPct = job.positions > 0 ? Math.round((job.filled / job.positions) * 100) : 0;
            return (
              <Card
                key={job.id}
                component={Link}
                to={`/jobs/${job.id}`}
                sx={{
                  textDecoration: "none",
                  transition: "transform 200ms, box-shadow 200ms",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--shadow-elegant)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">{job.title}</h3>
                      {job.client && <p className="text-xs text-muted-foreground mt-1">{job.client}</p>}
                    </div>
                    <Chip label={job.status} color={statusColor(job.status)} size="small" sx={{ flexShrink: 0 }} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-3">
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && <span>· {job.employment_type}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ageOf(job.created_at)}
                    </span>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.skills.slice(0, 4).map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                      ))}
                      {job.skills.length > 4 && (
                        <Chip
                          label={`+${job.skills.length - 4}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.filled}/{job.positions} filled
                    </span>
                    <Chip
                      label={job.priority}
                      size="small"
                      color={priorityColor(job.priority)}
                      variant="outlined"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={fillPct}
                    sx={{ height: 6, borderRadius: 999, backgroundColor: "hsl(var(--muted))" }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Jobs;
