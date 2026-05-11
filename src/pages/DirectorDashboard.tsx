import { useMemo, useState } from "react";
import {
  Users,
  UserSquare,
  Briefcase,
  Send,
  CalendarClock,
  Bot,
  Award,
  Trophy,
  IndianRupee,
  Smile,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  ArrowUpRight,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/data/dashboardMock";
import {
  director,
  directorKpis,
  managers,
  directorClients,
  directorTrend,
  directorAlerts,
  type DirectorManager,
} from "@/data/directorMock";

const kpiIcons = {
  managers: Users,
  recruiters: UserSquare,
  "open-jobs": Briefcase,
  subs: Send,
  "human-int": CalendarClock,
  "ai-int": Bot,
  offers: Award,
  joins: Trophy,
  revenue: IndianRupee,
  csat: Smile,
  ttf: Clock,
  "ai-share": Sparkles,
} as const;

const kpiAccents: Record<string, "primary" | "accent" | "success" | "warning"> = {
  managers: "primary",
  recruiters: "primary",
  "open-jobs": "primary",
  subs: "warning",
  "human-int": "accent",
  "ai-int": "primary",
  offers: "success",
  joins: "success",
  revenue: "success",
  csat: "success",
  ttf: "accent",
  "ai-share": "accent",
};

const healthStyle: Record<string, string> = {
  Excellent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Healthy: "bg-primary/15 text-primary border-primary/30",
  Watch: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "At risk": "bg-destructive/15 text-destructive border-destructive/30",
};

const prefStyle: Record<string, string> = {
  "AI-first": "bg-primary/15 text-primary border-primary/30",
  "Human-first": "bg-accent/15 text-accent border-accent/30",
  Mixed: "bg-muted text-muted-foreground border-border",
};

const trendBits = (n: number) => {
  const Icon = n > 0 ? TrendingUp : n < 0 ? TrendingDown : Minus;
  const color = n > 0 ? "text-emerald-500" : n < 0 ? "text-destructive" : "text-muted-foreground";
  return { Icon, color };
};

// ---------- Manager leaderboard with drill-down ----------
const ManagerLeaderboard = () => {
  const [expanded, setExpanded] = useState<string | null>(managers[0]?.id ?? null);
  const sorted = useMemo(
    () => [...managers].sort((a, b) => b.attainmentPct - a.attainmentPct),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Manager performance</CardTitle>
            <CardDescription>
              Click a manager to drill down into their recruiters
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {managers.length} managers · {managers.reduce((a, m) => a + m.teamSize, 0)} recruiters
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((m) => {
          const open = expanded === m.id;
          const { Icon: TIcon, color } = trendBits(m.trend);
          return (
            <div
              key={m.id}
              className={cn(
                "rounded-xl border bg-card/50 transition-colors",
                open ? "border-primary/40" : "border-border hover:border-primary/30",
              )}
            >
              <button
                onClick={() => setExpanded(open ? null : m.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-4"
              >
                {open ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{m.name}</span>
                    <Badge variant="outline" className={cn("text-[10px]", healthStyle[m.health])}>
                      {m.health}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.team} · {m.region} · {m.teamSize} recruiters
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-5 gap-3 text-center text-xs">
                  {[
                    { l: "Jobs", v: m.jobs },
                    { l: "Subs", v: m.submissions },
                    { l: "Intv", v: m.interviews },
                    { l: "AI", v: m.aiInterviews },
                    { l: "Joins", v: m.joins },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-base font-bold tabular-nums leading-none">
                        {s.v}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden lg:flex flex-col items-end min-w-[120px]">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    Attainment
                  </div>
                  <div className="w-28">
                    <Progress value={Math.min(m.attainmentPct, 100)} className="h-1.5" />
                  </div>
                  <div className="text-xs mt-1 tabular-nums">{m.attainmentPct}%</div>
                </div>
                <div className={cn("flex items-center gap-0.5 text-xs font-medium tabular-nums", color)}>
                  <TIcon className="h-3.5 w-3.5" />
                  {Math.abs(m.trend)}%
                </div>
              </button>

              {open && <RecruiterBreakout manager={m} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const RecruiterBreakout = ({ manager }: { manager: DirectorManager }) => (
  <div className="border-t border-border px-4 py-4 bg-muted/20 rounded-b-xl">
    <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      Drill-down · {manager.name} · {manager.team}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="text-left font-medium py-2 pr-3">Recruiter</th>
            <th className="text-right font-medium py-2 px-2">Jobs</th>
            <th className="text-right font-medium py-2 px-2">Subs</th>
            <th className="text-right font-medium py-2 px-2">Intv</th>
            <th className="text-right font-medium py-2 px-2">AI</th>
            <th className="text-right font-medium py-2 px-2">Offers</th>
            <th className="text-right font-medium py-2 px-2">Joins</th>
            <th className="text-right font-medium py-2 pl-2">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {manager.recruiters.map((r) => (
            <tr key={r.id} className="border-b border-border/40 last:border-0">
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">{r.role}</div>
                  </div>
                </div>
              </td>
              <td className="text-right tabular-nums px-2">{r.jobs}</td>
              <td className="text-right tabular-nums px-2 font-medium">{r.submissions}</td>
              <td className="text-right tabular-nums px-2">{r.interviews}</td>
              <td className="text-right tabular-nums px-2">{r.aiInterviews}</td>
              <td className="text-right tabular-nums px-2">{r.offers}</td>
              <td className="text-right tabular-nums px-2">{r.joins}</td>
              <td className="text-right tabular-nums pl-2">{r.conversionPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ---------- AI vs Human chart per client ----------
const InterviewMixChart = () => {
  const data = useMemo(
    () =>
      [...directorClients]
        .sort((a, b) => b.aiInterviews + b.humanInterviews - (a.aiInterviews + a.humanInterviews))
        .slice(0, 8)
        .map((c) => ({
          name: c.name.split(" ")[0],
          AI: c.aiInterviews,
          Human: c.humanInterviews,
        })),
    [],
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI vs Human interviews · by client</CardTitle>
        <CardDescription>Which clients lean on AI screening vs human panels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="AI" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Human" stackId="a" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ChannelMixDonut = () => {
  const totalAI = directorClients.reduce((a, c) => a + c.aiInterviews, 0);
  const totalHuman = directorClients.reduce((a, c) => a + c.humanInterviews, 0);
  const data = [
    { name: "AI interviews", value: totalAI, fill: "hsl(var(--primary))" },
    { name: "Human interviews", value: totalHuman, fill: "hsl(var(--accent))" },
  ];
  const aiPct = Math.round((totalAI / (totalAI + totalHuman)) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Interview channel mix</CardTitle>
        <CardDescription>Across all clients · MTD</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke="hsl(var(--card))"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-display text-3xl font-bold leading-none">{aiPct}%</div>
            <div className="text-xs text-muted-foreground mt-1">AI-driven</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            AI · {totalAI}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Human · {totalHuman}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- Weekly delivery trend ----------
const DeliveryTrend = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Delivery trend</CardTitle>
      <CardDescription>Submissions, interviews & offers by week</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={directorTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="submissions" fill="hsl(var(--muted-foreground) / 0.4)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="humanInterviews" name="Human" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="aiInterviews" name="AI" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="offers" fill="hsl(142 76% 36%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

// ---------- Client relationship table with tabs ----------
const ClientRelations = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg">Client relationship console</CardTitle>
            <CardDescription>
              Delivery scorecards · interview mix · revenue & CSAT
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">{directorClients.length} accounts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All clients</TabsTrigger>
            <TabsTrigger value="ai">AI-first</TabsTrigger>
            <TabsTrigger value="human">Human-first</TabsTrigger>
            <TabsTrigger value="risk">Watch / At risk</TabsTrigger>
          </TabsList>
          {([
            { v: "all", filter: () => true },
            { v: "ai", filter: (c: typeof directorClients[number]) => c.preference === "AI-first" },
            { v: "human", filter: (c: typeof directorClients[number]) => c.preference === "Human-first" },
            { v: "risk", filter: (c: typeof directorClients[number]) => c.health === "Watch" || c.health === "At risk" },
          ] as const).map((tab) => (
            <TabsContent key={tab.v} value={tab.v} className="mt-4">
              <ClientTable rows={directorClients.filter(tab.filter)} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const ClientTable = ({ rows }: { rows: typeof directorClients }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No accounts in this view.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1000px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="text-left font-medium py-2 pr-3">Client</th>
            <th className="text-left font-medium py-2 px-2">Manager</th>
            <th className="text-right font-medium py-2 px-2">Jobs</th>
            <th className="text-right font-medium py-2 px-2">Subs</th>
            <th className="text-right font-medium py-2 px-2">Human</th>
            <th className="text-right font-medium py-2 px-2">AI</th>
            <th className="text-left font-medium py-2 px-3">Mix</th>
            <th className="text-right font-medium py-2 px-2">Offers</th>
            <th className="text-right font-medium py-2 px-2">CSAT</th>
            <th className="text-right font-medium py-2 px-2">Revenue</th>
            <th className="text-left font-medium py-2 pl-2">Health</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const total = c.aiInterviews + c.humanInterviews;
            const aiPct = total ? Math.round((c.aiInterviews / total) * 100) : 0;
            return (
              <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="leading-tight min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {c.industry}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 text-xs">{c.manager}</td>
                <td className="text-right tabular-nums px-2">{c.openJobs}</td>
                <td className="text-right tabular-nums px-2">{c.submissions}</td>
                <td className="text-right tabular-nums px-2">{c.humanInterviews}</td>
                <td className="text-right tabular-nums px-2">{c.aiInterviews}</td>
                <td className="px-3 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-accent/30 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${aiPct}%` }} />
                    </div>
                    <Badge variant="outline" className={cn("text-[9px]", prefStyle[c.preference])}>
                      {c.preference}
                    </Badge>
                  </div>
                </td>
                <td className="text-right tabular-nums px-2">{c.offers}</td>
                <td className="text-right tabular-nums px-2">{c.csat.toFixed(1)}</td>
                <td className="text-right tabular-nums px-2 font-medium">{c.revenue}</td>
                <td className="pl-2">
                  <Badge variant="outline" className={cn("text-[10px]", healthStyle[c.health])}>
                    {c.health}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ---------- Top AI clients & alerts ----------
const TopAiClients = () => {
  const sorted = [...directorClients]
    .sort((a, b) => b.aiInterviews - a.aiInterviews)
    .slice(0, 5);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top AI-interview clients</CardTitle>
        <CardDescription>Highest AI interview demand this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((c, i) => {
          const total = c.aiInterviews + c.humanInterviews;
          const aiPct = total ? Math.round((c.aiInterviews / total) * 100) : 0;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {c.aiInterviews} AI · {aiPct}%
                  </span>
                </div>
                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${aiPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const alertIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
} as const;
const alertStyle = {
  info: "text-primary bg-primary/10 border-primary/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  critical: "text-destructive bg-destructive/10 border-destructive/20",
} as const;

const AlertsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Delivery alerts</CardTitle>
      <CardDescription>Signals that need your attention</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {directorAlerts.map((a) => {
        const Icon = alertIcon[a.level as keyof typeof alertIcon];
        return (
          <div
            key={a.id}
            className={cn(
              "flex gap-3 rounded-lg border p-3",
              alertStyle[a.level as keyof typeof alertStyle],
            )}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground">{a.message}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {a.owner} · {a.when}
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        );
      })}
    </CardContent>
  </Card>
);

// ---------- Page ----------
const DirectorDashboard = () => {
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {director.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {director.org} · {director.managerCount} managers · {director.recruiterCount} recruiters · {director.clientCount} active clients
        </p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {directorKpis.map((k) => (
          <KpiCard
            key={k.id}
            kpi={{ ...k, value: k.value as unknown as number } as Kpi}
            icon={kpiIcons[k.id as keyof typeof kpiIcons] ?? Briefcase}
            accent={kpiAccents[k.id]}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <DeliveryTrend />
        </div>
        <ChannelMixDonut />
      </section>

      <section className="mb-6">
        <ManagerLeaderboard />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <InterviewMixChart />
        </div>
        <TopAiClients />
      </section>

      <section className="mb-6">
        <ClientRelations />
      </section>

      <section className="grid grid-cols-1 gap-6">
        <AlertsCard />
      </section>
    </DashboardLayout>
  );
};

export default DirectorDashboard;
