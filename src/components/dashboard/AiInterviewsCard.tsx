import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { Bot, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { aiInterviews } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/lib/dateRange";

const statusMap = {
  Scheduled: { icon: Clock, color: "text-primary bg-primary/15 border-primary/30", chipBg: "hsl(var(--primary) / 0.15)", chipFg: "hsl(var(--primary))", chipBorder: "hsl(var(--primary) / 0.3)" },
  "In progress": { icon: Loader2, color: "text-accent bg-accent/15 border-accent/30", chipBg: "hsl(var(--accent) / 0.15)", chipFg: "hsl(var(--accent))", chipBorder: "hsl(var(--accent) / 0.3)" },
  Completed: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30", chipBg: "hsl(160 84% 39% / 0.15)", chipFg: "hsl(160 84% 45%)", chipBorder: "hsl(160 84% 39% / 0.3)" },
  Expired: { icon: AlertCircle, color: "text-destructive bg-destructive/15 border-destructive/30", chipBg: "hsl(var(--destructive) / 0.15)", chipFg: "hsl(var(--destructive))", chipBorder: "hsl(var(--destructive) / 0.3)" },
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const AiInterviewsCard = () => {
  const { range, factor } = useDateRange();
  const visible =
    range === "all"
      ? aiInterviews
      : aiInterviews.slice(0, Math.max(1, Math.round(aiInterviews.length * factor)));
  const completed = visible.filter((a) => a.status === "Completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : 0;

  return (
    <Card>
      <CardHeader
        avatar={
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <Bot className="h-5 w-5" />
          </div>
        }
        title={<span className="text-lg font-semibold tracking-tight">AI interviews</span>}
        subheader={<span className="text-sm text-muted-foreground">Automated screening pipeline</span>}
        action={
          <div className="text-right pr-4 pt-1">
            <div className="font-display text-2xl font-bold">{avgScore}</div>
            <div className="text-xs text-muted-foreground">avg score</div>
          </div>
        }
      />
      <CardContent className="space-y-2">
        {visible.map((ai) => {
          const meta = statusMap[ai.status];
          const Icon = meta.icon;
          return (
            <div
              key={ai.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", meta.color)}>
                <Icon className={cn("h-4 w-4", ai.status === "In progress" && "animate-spin")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{ai.candidate}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {ai.role} · {formatWhen(ai.scheduledFor)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Chip
                  label={ai.status}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    backgroundColor: meta.chipBg,
                    color: meta.chipFg,
                    borderColor: meta.chipBorder,
                  }}
                />
                {ai.score !== undefined && (
                  <span className="text-xs font-semibold tabular-nums">{ai.score}/100</span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AiInterviewsCard;
