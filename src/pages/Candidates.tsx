import { useEffect, useRef, useState } from "react";
import { Users, Upload, FileText, Trash2, Loader2, ExternalLink } from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  listCandidates,
  uploadResumeAndCreateCandidate,
  deleteCandidate,
  refreshResumeUrl,
  type CandidateRow,
} from "@/data/jobsApi";
import { useToast } from "@/hooks/use-toast";

const ACCEPT = ".pdf,.doc,.docx,.txt,.rtf";

const Candidates = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<CandidateRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    listCandidates()
      .then(setItems)
      .catch((err) => {
        toast({ title: "Couldn't load candidates", description: err?.message, variant: "destructive" });
        setItems([]);
      });
  }, [toast]);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    setProgress({ done: 0, total: arr.length });
    const created: CandidateRow[] = [];
    let failed = 0;
    for (let i = 0; i < arr.length; i++) {
      try {
        const row = await uploadResumeAndCreateCandidate(arr[i]);
        created.push(row);
      } catch (err: any) {
        failed++;
        toast({ title: `Failed: ${arr[i].name}`, description: err?.message, variant: "destructive" });
      }
      setProgress({ done: i + 1, total: arr.length });
    }
    if (created.length) setItems((prev) => [...created, ...(prev || [])]);
    toast({
      title: `Uploaded ${created.length} resume${created.length === 1 ? "" : "s"}`,
      description: failed ? `${failed} failed` : "Candidates added to your library.",
    });
    setUploading(false);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const openResume = async (c: CandidateRow) => {
    let url = c.resume_url;
    if (c.resume_path) {
      // Refresh signed URL to ensure it's valid
      const fresh = await refreshResumeUrl(c.resume_path);
      if (fresh) url = fresh;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (c: CandidateRow) => {
    if (!confirm(`Delete ${c.full_name}? This removes their resume too.`)) return;
    try {
      await deleteCandidate(c.id, c.resume_path);
      setItems((prev) => prev?.filter((x) => x.id !== c.id) || []);
      toast({ title: "Candidate removed" });
    } catch (err: any) {
      toast({ title: "Couldn't delete", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload one or many resumes — we'll add each as a candidate.</p>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? `Uploading ${progress.done}/${progress.total}` : "Upload resumes"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Dropzone */}
      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        sx={{
          mb: 4,
          p: 4,
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "divider",
          backgroundColor: dragOver ? "hsl(var(--primary) / 0.05)" : "transparent",
          transition: "all 200ms",
          cursor: "pointer",
        }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium">Drag & drop resumes here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to select multiple PDF, DOC, DOCX files</p>
        {uploading && (
          <LinearProgress
            variant="determinate"
            value={progress.total ? (progress.done / progress.total) * 100 : 0}
            sx={{ mt: 3, maxWidth: 320, mx: "auto", height: 6, borderRadius: 999 }}
          />
        )}
      </Card>

      {/* List */}
      {items === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={96} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center" }}>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">No candidates yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload a resume to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((c) => (
            <Card key={c.id} sx={{ transition: "transform 200ms, box-shadow 200ms", "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--shadow-elegant)" } }}>
              <CardContent sx={{ p: 2.5 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{c.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.resume_filename || "Resume"}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Chip
                        label="Resume"
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <IconButton size="small" onClick={() => openResume(c)} title="Open resume">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Candidates;
