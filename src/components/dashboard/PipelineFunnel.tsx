import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
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
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">{title}</span>}
        subheader={<span className="text-sm text-muted-foreground">{description}</span>}
      />
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
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 10, borderRadius: 999 }}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PipelineFunnel;
