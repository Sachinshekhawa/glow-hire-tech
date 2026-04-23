import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { topClients } from "@/data/dashboardMock";

const TopClients = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top clients</CardTitle>
        <CardDescription>By engagement this month</CardDescription>
      </CardHeader>
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
                {c.openJobs} open · {c.submissions} submissions · {c.offers} offers
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopClients;
