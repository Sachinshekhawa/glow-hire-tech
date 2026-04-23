import { Briefcase, BriefcaseBusiness, UserCheck, CalendarClock, Bot, Send, Award, Trophy } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import PerformanceStrip from "@/components/dashboard/PerformanceStrip";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import SubmissionsChart from "@/components/dashboard/SubmissionsChart";
import InterviewsTable from "@/components/dashboard/InterviewsTable";
import AiInterviewsCard from "@/components/dashboard/AiInterviewsCard";
import JobsCard from "@/components/dashboard/JobsCard";
import SubmissionsCard from "@/components/dashboard/SubmissionsCard";
import OffersCard from "@/components/dashboard/OffersCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TopClients from "@/components/dashboard/TopClients";
import { kpis, recruiter } from "@/data/dashboardMock";

const kpiIcons = {
  open: Briefcase,
  active: BriefcaseBusiness,
  assigned: UserCheck,
  interviews: CalendarClock,
  ai: Bot,
  submissions: Send,
  offers: Award,
  joined: Trophy,
} as const;

const kpiAccents: Record<string, "primary" | "accent" | "success" | "warning"> = {
  open: "primary",
  active: "primary",
  assigned: "accent",
  interviews: "accent",
  ai: "primary",
  submissions: "warning",
  offers: "success",
  joined: "success",
};

const Dashboard = () => {
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {recruiter.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your hiring pipeline today.
        </p>
      </div>

      {/* KPI grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <KpiCard
            key={k.id}
            kpi={k}
            icon={kpiIcons[k.id as keyof typeof kpiIcons] ?? Briefcase}
            accent={kpiAccents[k.id]}
          />
        ))}
      </section>

      {/* Performance strip */}
      <section className="mb-6">
        <PerformanceStrip />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SubmissionsChart />
        <PipelineFunnel />
      </section>

      {/* Interviews + AI interviews */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <InterviewsTable />
        </div>
        <AiInterviewsCard />
      </section>

      {/* Jobs + Submissions + Offers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <JobsCard />
        <SubmissionsCard />
        <OffersCard />
      </section>

      {/* Activity + clients */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <TopClients />
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
