import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { teamMembers } from "@/data/managerMock";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "on-leave": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  offline: "bg-muted text-muted-foreground border-border",
};

const TeamLeaderboard = () => {
  const sorted = [...teamMembers].sort((a, b) => b.submissions - a.submissions);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Team performance</CardTitle>
            <CardDescription>Per-recruiter submissions, interviews & offers</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">{teamMembers.length} recruiters</Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left font-medium py-2 pr-3">Recruiter</th>
              <th className="text-right font-medium py-2 px-2">Jobs</th>
              <th className="text-right font-medium py-2 px-2">Subs</th>
              <th className="text-right font-medium py-2 px-2">Intv</th>
              <th className="text-right font-medium py-2 px-2">AI</th>
              <th className="text-right font-medium py-2 px-2">Offers</th>
              <th className="text-right font-medium py-2 px-2">Joins</th>
              <th className="text-right font-medium py-2 px-2">Conv.</th>
              <th className="text-right font-medium py-2 pl-2">Δ wk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const Trend = m.trend > 0 ? TrendingUp : m.trend < 0 ? TrendingDown : Minus;
              const trendColor =
                m.trend > 0 ? "text-emerald-500" : m.trend < 0 ? "text-destructive" : "text-muted-foreground";
              return (
                <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {m.role}
                          <Badge variant="outline" className={cn("text-[9px] py-0", statusStyle[m.status])}>
                            {m.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right tabular-nums px-2">{m.jobs}</td>
                  <td className="text-right tabular-nums px-2 font-medium">{m.submissions}</td>
                  <td className="text-right tabular-nums px-2">{m.interviews}</td>
                  <td className="text-right tabular-nums px-2">{m.aiInterviews}</td>
                  <td className="text-right tabular-nums px-2">{m.offers}</td>
                  <td className="text-right tabular-nums px-2">{m.joins}</td>
                  <td className="text-right tabular-nums px-2">{m.conversionPct}%</td>
                  <td className="pl-2">
                    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium justify-end w-full", trendColor)}>
                      <Trend className="h-3 w-3" />
                      {Math.abs(m.trend)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default TeamLeaderboard;
