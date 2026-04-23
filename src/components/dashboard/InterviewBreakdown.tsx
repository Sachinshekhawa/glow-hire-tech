import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { interviewMix, aiInterviewMix } from "@/data/managerMock";

const InterviewBreakdown = () => {
  const clientRows = [
    { label: "Scheduled", value: interviewMix.scheduled, color: "bg-primary" },
    { label: "In progress", value: interviewMix.inProgress, color: "bg-accent" },
    { label: "Completed", value: interviewMix.completed, color: "bg-emerald-500" },
    { label: "Rescheduled", value: interviewMix.rescheduled, color: "bg-amber-500" },
    { label: "No-show", value: interviewMix.noShow, color: "bg-destructive" },
    { label: "Cancelled", value: interviewMix.cancelled, color: "bg-muted-foreground" },
  ];
  const aiRows = [
    { label: "Scheduled", value: aiInterviewMix.scheduled, color: "bg-primary" },
    { label: "In progress", value: aiInterviewMix.inProgress, color: "bg-accent" },
    { label: "Completed", value: aiInterviewMix.completed, color: "bg-emerald-500" },
    { label: "Expired", value: aiInterviewMix.expired, color: "bg-destructive" },
  ];

  const Section = ({ title, total, rows }: { title: string; total: number; rows: typeof clientRows }) => (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="font-display text-xl font-bold tabular-nums">{total}</div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => {
          const pct = total ? (r.value / total) * 100 : 0;
          return (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium tabular-nums">{r.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`${r.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const clientTotal = clientRows.reduce((s, r) => s + r.value, 0);
  const aiTotal = aiRows.reduce((s, r) => s + r.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Interview breakdown</CardTitle>
        <CardDescription>Client interviews and AI interviews status mix</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Section title="Client interviews" total={clientTotal} rows={clientRows} />
        <Section title="AI interviews" total={aiTotal} rows={aiRows} />
      </CardContent>
    </Card>
  );
};

export default InterviewBreakdown;
