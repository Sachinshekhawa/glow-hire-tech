import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { aiInterviews } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const statusMap = {
  Scheduled: { icon: Clock, color: "text-primary bg-primary/15 border-primary/30" },
  "In progress": { icon: Loader2, color: "text-accent bg-accent/15 border-accent/30" },
  Completed: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30" },
  Expired: { icon: AlertCircle, color: "text-destructive bg-destructive/15 border-destructive/30" },
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const AiInterviewsCard = () => {
  const completed = aiInterviews.filter((a) => a.status === "Completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI interviews</CardTitle>
              <CardDescription>Automated screening pipeline</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold">{avgScore}</div>
            <div className="text-xs text-muted-foreground">avg score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {aiInterviews.map((ai) => {
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
                <Badge variant="outline" className={cn("text-[10px]", meta.color)}>
                  {ai.status}
                </Badge>
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
