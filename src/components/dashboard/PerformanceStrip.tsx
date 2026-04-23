import { Card } from "@/components/ui/card";
import { Clock, ArrowRightLeft, Target, Zap } from "lucide-react";
import { supportingMetrics } from "@/data/dashboardMock";

const items = [
  {
    label: "Avg time to fill",
    value: `${supportingMetrics.avgTimeToFillDays}d`,
    icon: Clock,
    note: "−2 days vs last month",
  },
  {
    label: "Submission → interview",
    value: `${supportingMetrics.submissionToInterview}%`,
    icon: ArrowRightLeft,
    note: "+5% MoM",
  },
  {
    label: "Interview → offer",
    value: `${supportingMetrics.interviewToOffer}%`,
    icon: Target,
    note: "stable",
  },
  {
    label: "Avg response time",
    value: `${supportingMetrics.responseTimeHours}h`,
    icon: Zap,
    note: "−30 min vs last week",
  },
];

const PerformanceStrip = () => {
  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:divide-x lg:divide-border">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className={i > 0 ? "lg:pl-5" : ""}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </div>
              <div className="mt-1.5 font-display text-2xl font-bold">{it.value}</div>
              <div className="text-xs text-muted-foreground">{it.note}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PerformanceStrip;
