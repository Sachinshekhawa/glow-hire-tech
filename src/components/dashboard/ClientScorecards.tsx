import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowUpRight } from "lucide-react";
import { clientScorecards } from "@/data/managerMock";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/lib/dateRange";

const healthStyle: Record<string, string> = {
  Excellent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Healthy: "bg-primary/15 text-primary border-primary/30",
  Watch: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "At risk": "bg-destructive/15 text-destructive border-destructive/30",
};

const ClientScorecards = () => {
  const { scale } = useDateRange();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Client scorecards</CardTitle>
            <CardDescription>
              Candidates supplied, submissions, interviews & offers per client
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">{clientScorecards.length} clients</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {clientScorecards.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-card/50 p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.industry} · {c.owner}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px] shrink-0", healthStyle[c.health])}>
                {c.health}
              </Badge>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: "Jobs", value: scale(c.openJobs) },
                { label: "Cands", value: scale(c.candidates) },
                { label: "Subs", value: scale(c.submissions) },
                { label: "Intv", value: scale(c.interviews) },
                { label: "Offers", value: scale(c.offers) },
              ].map((m) => (
                <div key={m.label} className="rounded-md bg-muted/40 px-1 py-2">
                  <div className="font-display text-base font-bold leading-none tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Revenue <span className="text-foreground font-medium">{c.revenue}</span> · {scale(c.joins)} joined
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                {c.lastActivity}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClientScorecards;
