import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { submissions } from "@/data/dashboardMock";

const stageChip: Record<string, { bg: string; color: string; border: string }> = {
  Submitted: { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
  "Client review": { bg: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "hsl(var(--primary) / 0.3)" },
  Shortlisted: { bg: "hsl(var(--accent) / 0.15)", color: "hsl(var(--accent))", border: "hsl(var(--accent) / 0.3)" },
  Interview: { bg: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 55%)", border: "hsl(38 92% 50% / 0.3)" },
  Offer: { bg: "hsl(160 84% 39% / 0.15)", color: "hsl(160 84% 45%)", border: "hsl(160 84% 39% / 0.3)" },
  Rejected: { bg: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.3)" },
};

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const SubmissionsCard = () => {
  return (
    <Card>
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">Recent submissions</span>}
        subheader={<span className="text-sm text-muted-foreground">Candidates submitted to clients</span>}
      />
      <CardContent className="space-y-2">
        {submissions.map((s) => {
          const c = stageChip[s.stage];
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              <Avatar sx={{ width: 36, height: 36, fontSize: 12, background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}>
                {initials(s.candidate)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.candidate}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.role} · {s.client}
                </div>
              </div>
              <Chip
                label={s.stage}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10, backgroundColor: c.bg, color: c.color, borderColor: c.border }}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SubmissionsCard;
