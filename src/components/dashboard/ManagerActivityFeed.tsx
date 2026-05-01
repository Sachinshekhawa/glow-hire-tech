import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { managerActivity } from "@/data/managerMock";
import { Award, Send, CalendarClock, Building2, Bot, AlertTriangle } from "lucide-react";
import { useDateRange } from "@/lib/dateRange";

const iconMap = {
  offer: Award,
  submission: Send,
  interview: CalendarClock,
  client: Building2,
  ai: Bot,
  alert: AlertTriangle,
} as const;

const colorMap = {
  offer: "text-emerald-500 bg-emerald-500/10",
  submission: "text-primary bg-primary/10",
  interview: "text-accent bg-accent/10",
  client: "text-amber-500 bg-amber-500/10",
  ai: "text-primary bg-primary/10",
  alert: "text-destructive bg-destructive/10",
} as const;

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ManagerActivityFeed = () => {
  const { range, factor } = useDateRange();
  const visible =
    range === "all"
      ? managerActivity
      : managerActivity.slice(0, Math.max(1, Math.round(managerActivity.length * factor)));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team activity</CardTitle>
        <CardDescription>Latest moves across recruiters and clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((a) => {
          const Icon = iconMap[a.kind];
          return (
            <div key={a.id} className="flex gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {initialsOf(a.who)}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background ${colorMap[a.kind]}`}>
                  <Icon className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.message}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.when}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ManagerActivityFeed;
