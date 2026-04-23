import {
  Briefcase,
  Send,
  CalendarClock,
  Bot,
  Award,
  Trophy,
  Clock,
  ThumbsUp,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import TeamLeaderboard from "@/components/dashboard/TeamLeaderboard";
import ClientScorecards from "@/components/dashboard/ClientScorecards";
import TeamTrendChart from "@/components/dashboard/TeamTrendChart";
import InterviewBreakdown from "@/components/dashboard/InterviewBreakdown";
import GoalsCard from "@/components/dashboard/GoalsCard";
import ManagerActivityFeed from "@/components/dashboard/ManagerActivityFeed";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import { managerKpis, manager, teamPipeline } from "@/data/managerMock";
import type { Kpi } from "@/data/dashboardMock";

const iconMap = {
  "team-jobs": Briefcase,
  "team-subs": Send,
  "team-interviews": CalendarClock,
  "team-ai": Bot,
  "team-offers": Award,
  "team-joins": Trophy,
  ttf: Clock,
  accept: ThumbsUp,
} as const;

const accentMap: Record<string, "primary" | "accent" | "success" | "warning"> = {
  "team-jobs": "primary",
  "team-subs": "warning",
  "team-interviews": "accent",
  "team-ai": "primary",
  "team-offers": "success",
  "team-joins": "success",
  ttf: "accent",
  accept: "success",
};

const ManagerDashboard = () => {
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  // Adapt manager KPIs (string|number values) to the Kpi shape KpiCard expects
  // by stringifying — KpiCard renders the value directly.
  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {manager.name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {manager.team} · {manager.teamSize} recruiters reporting to you
          </p>
        </div>
      </div>

      {/* KPI grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {managerKpis.map((k) => (
          <KpiCard
            key={k.id}
            kpi={{ ...k, value: k.value as unknown as number } as Kpi}
            icon={iconMap[k.id as keyof typeof iconMap] ?? Briefcase}
            accent={accentMap[k.id]}
          />
        ))}
      </section>

      {/* Trends + goals */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <TeamTrendChart />
        </div>
        <GoalsCard />
      </section>

      {/* Team leaderboard */}
      <section className="mb-6">
        <TeamLeaderboard />
      </section>

      {/* Interview breakdown + funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <InterviewBreakdown />
        <PipelineFunnel data={teamPipeline} title="Team pipeline" description="Across all recruiters" />
      </section>

      {/* Client scorecards */}
      <section className="mb-6">
        <ClientScorecards />
      </section>

      {/* Activity */}
      <section className="grid grid-cols-1 gap-6">
        <ManagerActivityFeed />
      </section>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
