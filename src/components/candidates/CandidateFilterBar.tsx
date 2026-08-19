import { useMemo, useState, MouseEvent } from "react";
import InputBase from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Search, SlidersHorizontal, X, ArrowDownUp } from "lucide-react";
import type { CandidateRow } from "@/data/jobsApi";

export type CandidateFilters = {
  q: string;
  name: string;
  email: string;
  phone: string;
  file: string;
  notes: string;
  fileType: string;
  contact: "any" | "email" | "phone" | "both" | "none";
  hasNotes: "any" | "yes" | "no";
  added: "any" | "today" | "7d" | "30d" | "90d";
  from: string;
  to: string;
  sort: "newest" | "oldest" | "name" | "name_desc" | "updated";
};

export const emptyCandidateFilters: CandidateFilters = {
  q: "",
  name: "",
  email: "",
  phone: "",
  file: "",
  notes: "",
  fileType: "any",
  contact: "any",
  hasNotes: "any",
  added: "any",
  from: "",
  to: "",
  sort: "newest",
};

const ext = (c: CandidateRow) => (c.resume_filename?.split(".").pop() || "").toLowerCase();

const inc = (hay: string | null | undefined, needle: string) =>
  !needle || (hay || "").toLowerCase().includes(needle.toLowerCase().trim());

const sinceDays = (v: CandidateFilters["added"]) =>
  v === "today" ? 0 : v === "7d" ? 7 : v === "30d" ? 30 : v === "90d" ? 90 : null;

export const applyCandidateFilters = (rows: CandidateRow[], f: CandidateFilters) => {
  const days = sinceDays(f.added);
  const from = f.from ? new Date(f.from).getTime() : null;
  const to = f.to ? new Date(f.to).getTime() + 86_400_000 : null;

  const out = rows.filter((c) => {
    if (f.q) {
      const blob = [c.full_name, c.email, c.phone, c.resume_filename, c.notes].join(" ").toLowerCase();
      if (!blob.includes(f.q.toLowerCase().trim())) return false;
    }
    if (!inc(c.full_name, f.name)) return false;
    if (!inc(c.email, f.email)) return false;
    if (!inc(c.phone, f.phone)) return false;
    if (!inc(c.resume_filename, f.file)) return false;
    if (!inc(c.notes, f.notes)) return false;
    if (f.fileType !== "any" && ext(c) !== f.fileType) return false;

    const hasEmail = Boolean(c.email);
    const hasPhone = Boolean(c.phone);
    if (f.contact === "email" && !hasEmail) return false;
    if (f.contact === "phone" && !hasPhone) return false;
    if (f.contact === "both" && !(hasEmail && hasPhone)) return false;
    if (f.contact === "none" && (hasEmail || hasPhone)) return false;

    if (f.hasNotes === "yes" && !c.notes) return false;
    if (f.hasNotes === "no" && c.notes) return false;

    const created = new Date(c.created_at).getTime();
    if (days !== null) {
      const start = new Date();
      if (days === 0) start.setHours(0, 0, 0, 0);
      else start.setDate(start.getDate() - days);
      if (created < start.getTime()) return false;
    }
    if (from !== null && created < from) return false;
    if (to !== null && created > to) return false;
    return true;
  });

  const cmp: Record<CandidateFilters["sort"], (a: CandidateRow, b: CandidateRow) => number> = {
    newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    oldest: (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
    name: (a, b) => a.full_name.localeCompare(b.full_name),
    name_desc: (a, b) => b.full_name.localeCompare(a.full_name),
    updated: (a, b) => +new Date(b.updated_at) - +new Date(a.updated_at),
  };
  return [...out].sort(cmp[f.sort]);
};

const chipLabels = (f: CandidateFilters): { key: keyof CandidateFilters; label: string }[] => {
  const out: { key: keyof CandidateFilters; label: string }[] = [];
  if (f.name) out.push({ key: "name", label: `Name: ${f.name}` });
  if (f.email) out.push({ key: "email", label: `Email: ${f.email}` });
  if (f.phone) out.push({ key: "phone", label: `Phone: ${f.phone}` });
  if (f.file) out.push({ key: "file", label: `File: ${f.file}` });
  if (f.notes) out.push({ key: "notes", label: `Notes: ${f.notes}` });
  if (f.fileType !== "any") out.push({ key: "fileType", label: `.${f.fileType}` });
  if (f.contact !== "any") out.push({ key: "contact", label: `Contact: ${f.contact}` });
  if (f.hasNotes !== "any") out.push({ key: "hasNotes", label: `Notes: ${f.hasNotes}` });
  if (f.added !== "any") out.push({ key: "added", label: `Added: ${f.added}` });
  if (f.from) out.push({ key: "from", label: `From ${f.from}` });
  if (f.to) out.push({ key: "to", label: `To ${f.to}` });
  return out;
};

type Props = {
  value: CandidateFilters;
  onChange: (next: CandidateFilters) => void;
  rows: CandidateRow[];
  resultCount: number;
};

const CandidateFilterBar = ({ value, onChange, rows, resultCount }: Props) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const set = <K extends keyof CandidateFilters>(k: K, v: CandidateFilters[K]) =>
    onChange({ ...value, [k]: v });

  const types = useMemo(() => {
    const s = new Set(rows.map(ext).filter(Boolean));
    return Array.from(s).sort();
  }, [rows]);

  const active = chipLabels(value);
  const open = Boolean(anchor);

  const field = {
    size: "small" as const,
    fullWidth: true,
    slotProps: { inputLabel: { shrink: true } },
  };

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur-sm">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <InputBase
            value={value.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Search name, email, phone, file, notes…"
            sx={{ flex: 1, fontSize: 14 }}
          />
          {value.q && (
            <button onClick={() => set("q", "")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={value.added}
          onChange={(_, v) => v && set("added", v)}
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              borderColor: "hsl(var(--border))",
              px: 1.5,
              fontSize: 12,
            },
          }}
        >
          <ToggleButton value="any">All</ToggleButton>
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="7d">7d</ToggleButton>
          <ToggleButton value="30d">30d</ToggleButton>
        </ToggleButtonGroup>

        <Badge color="primary" badgeContent={active.length} overlap="circular">
          <Button
            onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
            startIcon={<SlidersHorizontal className="h-4 w-4" />}
            sx={{ textTransform: "none", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            Filters
          </Button>
        </Badge>

        <TextField
          select
          size="small"
          value={value.sort}
          onChange={(e) => set("sort", e.target.value as CandidateFilters["sort"])}
          sx={{ minWidth: 150 }}
          slotProps={{ input: { startAdornment: <ArrowDownUp className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> } }}
        >
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
          <MenuItem value="name">Name A–Z</MenuItem>
          <MenuItem value="name_desc">Name Z–A</MenuItem>
          <MenuItem value="updated">Recently updated</MenuItem>
        </TextField>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">
          {resultCount} of {rows.length} candidates
        </span>
        {active.map((a) => (
          <Chip
            key={a.key}
            label={a.label}
            size="small"
            onDelete={() => set(a.key, emptyCandidateFilters[a.key] as never)}
            sx={{ height: 24, fontSize: 11 }}
          />
        ))}
        {(active.length > 0 || value.q) && (
          <Button size="small" sx={{ textTransform: "none", fontSize: 12 }} onClick={() => onChange(emptyCandidateFilters)}>
            Clear all
          </Button>
        )}
      </div>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 380, p: 2.5, borderRadius: 3, mt: 1 } } }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-semibold">Filter candidates</p>
          <Button size="small" sx={{ textTransform: "none" }} onClick={() => onChange({ ...emptyCandidateFilters, q: value.q, sort: value.sort })}>
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <TextField {...field} label="Name" value={value.name} onChange={(e) => set("name", e.target.value)} />
          <TextField {...field} label="Email" value={value.email} onChange={(e) => set("email", e.target.value)} />
          <TextField {...field} label="Phone" value={value.phone} onChange={(e) => set("phone", e.target.value)} />
          <TextField {...field} label="Resume file" value={value.file} onChange={(e) => set("file", e.target.value)} />
          <div className="col-span-2">
            <TextField {...field} label="Notes contain" value={value.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <TextField {...field} select label="File type" value={value.fileType} onChange={(e) => set("fileType", e.target.value)}>
            <MenuItem value="any">Any</MenuItem>
            {types.map((t) => (
              <MenuItem key={t} value={t}>
                .{t}
              </MenuItem>
            ))}
          </TextField>
          <TextField {...field} select label="Contact info" value={value.contact} onChange={(e) => set("contact", e.target.value as CandidateFilters["contact"])}>
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="email">Has email</MenuItem>
            <MenuItem value="phone">Has phone</MenuItem>
            <MenuItem value="both">Has both</MenuItem>
            <MenuItem value="none">Missing both</MenuItem>
          </TextField>
          <TextField {...field} select label="Notes" value={value.hasNotes} onChange={(e) => set("hasNotes", e.target.value as CandidateFilters["hasNotes"])}>
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="yes">With notes</MenuItem>
            <MenuItem value="no">Without notes</MenuItem>
          </TextField>
          <TextField {...field} select label="Added" value={value.added} onChange={(e) => set("added", e.target.value as CandidateFilters["added"])}>
            <MenuItem value="any">All time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </TextField>
          <TextField {...field} type="date" label="Added from" value={value.from} onChange={(e) => set("from", e.target.value)} />
          <TextField {...field} type="date" label="Added to" value={value.to} onChange={(e) => set("to", e.target.value)} />
        </div>
      </Popover>
    </div>
  );
};

export default CandidateFilterBar;
