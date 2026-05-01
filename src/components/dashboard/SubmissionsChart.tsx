import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { submissionsTrend } from "@/data/dashboardMock";
import { useDateRange } from "@/lib/dateRange";

const SubmissionsChart = () => {
  const { scale, label } = useDateRange();
  const data = submissionsTrend.map((d) => ({ ...d, count: scale(d.count) }));
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">Submissions trend</span>}
        subheader={
          <span className="text-sm text-muted-foreground">
            {label} · {total} candidates submitted
          </span>
        }
        action={
          <div className="text-right pr-4 pt-1">
            <div className="font-display text-2xl font-bold">{total}</div>
            <div className="text-xs text-emerald-500 font-medium">{label}</div>
          </div>
        }
      />
      <CardContent>
        <div className="flex items-end justify-between gap-3 h-40">
          {data.map((d) => {
            const h = (d.count / max) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary to-accent hover:opacity-90 transition-opacity relative group"
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
