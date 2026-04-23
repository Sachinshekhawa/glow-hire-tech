import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { teamSubmissionsTrend } from "@/data/managerMock";

const TeamTrendChart = () => {
  const max = Math.max(
    ...teamSubmissionsTrend.flatMap((d) => [d.submissions, d.interviews]),
  );
  const totalSubs = teamSubmissionsTrend.reduce((s, d) => s + d.submissions, 0);
  const totalIntv = teamSubmissionsTrend.reduce((s, d) => s + d.interviews, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Team output · last 7 days</CardTitle>
            <CardDescription>
              Submissions vs client interviews by day
            </CardDescription>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-sm bg-primary mr-1.5" />
              {totalSubs} subs
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-sm bg-accent mr-1.5" />
              {totalIntv} interviews
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3 h-44">
          {teamSubmissionsTrend.map((d) => {
            const sH = (d.submissions / max) * 100;
            const iH = (d.interviews / max) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end gap-1 h-full">
                  <div
                    className="w-2.5 rounded-t-sm bg-gradient-to-t from-primary to-primary/60 group relative"
                    style={{ height: `${sH}%`, minHeight: "6px" }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      {d.submissions} subs
                    </div>
                  </div>
                  <div
                    className="w-2.5 rounded-t-sm bg-gradient-to-t from-accent to-accent/60 group relative"
                    style={{ height: `${iH}%`, minHeight: "6px" }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      {d.interviews} intv
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamTrendChart;
