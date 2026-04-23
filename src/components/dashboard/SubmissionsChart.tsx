import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { submissionsTrend } from "@/data/dashboardMock";

const SubmissionsChart = () => {
  const max = Math.max(...submissionsTrend.map((d) => d.count));
  const total = submissionsTrend.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Weekly submissions</CardTitle>
            <CardDescription>Last 7 days · {total} candidates submitted</CardDescription>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold">{total}</div>
            <div className="text-xs text-emerald-500 font-medium">+9% vs last week</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3 h-40">
          {submissionsTrend.map((d) => {
            const h = (d.count / max) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary to-accent shadow-glow/40 hover:opacity-90 transition-opacity relative group"
                    style={{ height: `${h}%`, minHeight: "8px" }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      {d.count}
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

export default SubmissionsChart;
