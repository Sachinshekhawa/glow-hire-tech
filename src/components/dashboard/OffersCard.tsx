import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { offers } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const statusStyle = {
  Pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Accepted: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Joined: "bg-primary/15 text-primary border-primary/30",
  Declined: "bg-destructive/15 text-destructive border-destructive/30",
};

const OffersCard = () => {
  const accepted = offers.filter((o) => o.status === "Accepted" || o.status === "Joined").length;
  const acceptanceRate = Math.round((accepted / offers.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Offers
            </CardTitle>
            <CardDescription>Extended to your candidates</CardDescription>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold">{acceptanceRate}%</div>
            <div className="text-xs text-muted-foreground">acceptance</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {offers.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{o.candidate}</div>
              <div className="text-xs text-muted-foreground truncate">
                {o.role} · {o.client}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold tabular-nums">{o.amount}</div>
              <Badge variant="outline" className={cn("text-[10px] mt-0.5", statusStyle[o.status])}>
                {o.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OffersCard;
