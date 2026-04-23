import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { pipelineFunnel } from "@/data/dashboardMock";

type Props = {
  data?: { stage: string; count: number }[];
  title?: string;
  description?: string;
};

const PipelineFunnel = ({
  data = pipelineFunnel,
  title = "Hiring pipeline",
  description = "Candidate progression across stages",
}: Props) => {
  const max = Math.max(...data.map((s) => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((stage, i) => {
          const pct = (stage.count / max) * 100;
          const conversion =
            i === 0 ? null : Math.round((stage.count / data[i - 1].count) * 100);
          return (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <div className="flex items-center gap-3">
                  {conversion !== null && (
                    <span className="text-xs text-muted-foreground">
                      {conversion}% converted
                    </span>
                  )}
                  <span className="font-semibold tabular-nums">{stage.count}</span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PipelineFunnel;
