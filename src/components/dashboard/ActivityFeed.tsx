import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { Award, CalendarClock, Bot, Send, Briefcase } from "lucide-react";
import { activity } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const iconMap = {
  offer: { Icon: Award, color: "text-emerald-500 bg-emerald-500/15" },
  interview: { Icon: CalendarClock, color: "text-accent bg-accent/15" },
  ai: { Icon: Bot, color: "text-primary bg-primary/15" },
  submission: { Icon: Send, color: "text-amber-500 bg-amber-500/15" },
  job: { Icon: Briefcase, color: "text-primary bg-primary/15" },
};

const ActivityFeed = () => {
  return (
    <Card>
      <CardHeader
        title={<span className="text-lg font-semibold tracking-tight">Activity feed</span>}
        subheader={<span className="text-sm text-muted-foreground">Latest updates across your work</span>}
      />
      <CardContent>
        <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {activity.map((e) => {
            const meta = iconMap[e.kind];
            const Icon = meta.Icon;
            return (
              <li key={e.id} className="relative flex gap-3 pl-0">
                <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border", meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm leading-snug">{e.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.when}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
