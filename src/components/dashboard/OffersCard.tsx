import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { Award } from "lucide-react";
import { offers } from "@/data/dashboardMock";
import { useDateRange } from "@/lib/dateRange";

const statusChip = {
  Pending: { bg: "hsl(38 92% 50% / 0.15)", color: "hsl(38 92% 55%)", border: "hsl(38 92% 50% / 0.3)" },
  Accepted: { bg: "hsl(160 84% 39% / 0.15)", color: "hsl(160 84% 45%)", border: "hsl(160 84% 39% / 0.3)" },
  Joined: { bg: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "hsl(var(--primary) / 0.3)" },
  Declined: { bg: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.3)" },
};

const OffersCard = () => {
  const { range, factor, filterByDate } = useDateRange();
  const filtered = filterByDate(offers, (o) => o.sentAt);
  const visible =
    range === "all"
      ? offers
      : filtered.length
        ? filtered
        : offers.slice(0, Math.max(1, Math.round(offers.length * factor)));
  const accepted = visible.filter((o) => o.status === "Accepted" || o.status === "Joined").length;
  const acceptanceRate = visible.length ? Math.round((accepted / visible.length) * 100) : 0;

  return (
    <Card>
      <CardHeader
        title={
          <span className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Offers
          </span>
        }
        subheader={<span className="text-sm text-muted-foreground">Extended to your candidates</span>}
        action={
          <div className="text-right pr-4 pt-1">
            <div className="font-display text-2xl font-bold">{acceptanceRate}%</div>
            <div className="text-xs text-muted-foreground">acceptance</div>
          </div>
        }
      />
      <CardContent className="space-y-2">
        {visible.map((o) => {
          const c = statusChip[o.status];
          return (
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
                <Chip
                  label={o.status}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5, height: 20, fontSize: 10, backgroundColor: c.bg, color: c.color, borderColor: c.border }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default OffersCard;
