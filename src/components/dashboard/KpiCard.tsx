import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/data/dashboardMock";

type Props = {
  kpi: Kpi;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "warning";
};

const accentMap = {
  primary: "from-primary/20 to-primary/0 text-primary",
  accent: "from-accent/20 to-accent/0 text-accent",
  success: "from-emerald-500/20 to-emerald-500/0 text-emerald-500",
  warning: "from-amber-500/20 to-amber-500/0 text-amber-500",
};

const KpiCard = ({ kpi, icon: Icon, accent = "primary" }: Props) => {
  const trendIcon =
    kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor =
    kpi.trend === "up"
      ? "text-emerald-500"
      : kpi.trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card
      className="relative overflow-hidden p-5 group transition-colors"
      sx={{
        "&:hover": { borderColor: "hsl(var(--primary) / 0.4)" },
      }}
    >
      <Box
        className={cn(
          "absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl pointer-events-none",
          accentMap[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {kpi.label}
          </p>
          <div className="flex items-end gap-2">
            <span className="font-display text-3xl font-bold leading-none">
              {kpi.value}
            </span>
            <span className={cn("flex items-center gap-0.5 text-xs font-medium pb-1", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(kpi.delta)}%
            </span>
          </div>
          {kpi.hint && <p className="text-xs text-muted-foreground">{kpi.hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br border border-border",
            accentMap[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;
