import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { goals } from "@/data/managerMock";
import { useDateRange } from "@/lib/dateRange";

const GoalsCard = () => {
  const { scale, label } = useDateRange();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Goals · {label}</CardTitle>
        <CardDescription>Team progress against targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((g) => {
          const value = g.unit === "%" ? g.value : scale(g.value);
          const pct = Math.min(100, (value / g.target) * 100);
          const onTrack = pct >= 75;
          return (
            <div key={g.id}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm font-medium">{g.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  <span className="text-foreground font-semibold">{value}{g.unit}</span> / {g.target}{g.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${onTrack ? "bg-gradient-to-r from-primary to-accent" : "bg-amber-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {pct.toFixed(0)}% of target {onTrack ? "· on track" : "· needs push"}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
