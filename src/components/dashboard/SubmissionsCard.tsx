import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { submissions } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const stageStyle: Record<string, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  "Client review": "bg-primary/15 text-primary border-primary/30",
  Shortlisted: "bg-accent/15 text-accent border-accent/30",
  Interview: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Offer: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const SubmissionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent submissions</CardTitle>
        <CardDescription>Candidates submitted to clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {submissions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-muted text-xs font-semibold">
                {initials(s.candidate)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{s.candidate}</div>
              <div className="text-xs text-muted-foreground truncate">
                {s.role} · {s.client}
              </div>
            </div>
            <Badge variant="outline" className={cn("text-[10px] shrink-0", stageStyle[s.stage])}>
              {s.stage}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SubmissionsCard;
