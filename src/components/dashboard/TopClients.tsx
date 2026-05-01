import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { Building2 } from "lucide-react";
import { topClients } from "@/data/dashboardMock";
import { useDateRange } from "@/lib/dateRange";

const TopClients = () => {
  const { scale, label } = useDateRange();
  return (
    <Card>
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">Top clients</span>}
        subheader={<span className="text-sm text-muted-foreground">By engagement · {label}</span>}
      />
      <CardContent className="space-y-2">
        {topClients.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {scale(c.openJobs)} open · {scale(c.submissions)} submissions · {scale(c.offers)} offers
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopClients;
