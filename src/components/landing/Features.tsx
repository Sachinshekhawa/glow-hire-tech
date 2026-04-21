import { Search, FileSearch, Video, MessagesSquare, BarChart3, Code2, ScanFace, Globe } from "lucide-react";

const groups = [
  {
    title: "Sourcing",
    icon: Search,
    desc: "AI candidate discovery across 30+ platforms with ML-based job-to-candidate matching.",
  },
  {
    title: "Screening",
    icon: FileSearch,
    desc: "Resume parsing, ranking and skill extraction in seconds — at scale.",
  },
  {
    title: "Assessments",
    icon: Code2,
    desc: "Auto-evaluated coding tests, skill assessments and custom screening flows.",
  },
  {
    title: "Interviewing",
    icon: Video,
    desc: "AI voice & video interviews with sentiment, behavioral and proctoring insights.",
  },
  {
    title: "Engagement",
    icon: MessagesSquare,
    desc: "Multi-channel outreach, drip campaigns and smart follow-ups on autopilot.",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    desc: "Pipeline health, recruiter performance and hiring forecasts — real-time.",
  },
  {
    title: "Fraud Detection",
    icon: ScanFace,
    desc: "Identity checks, plagiarism scans and behavioral anomaly detection.",
  },
  {
    title: "Global Hiring",
    icon: Globe,
    desc: "Multi-language AI, time-zone aware scheduling and remote-first workflows.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Capabilities
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Every recruiting workflow, <span className="gradient-text">automated.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Eight integrated engines that replace your sourcing tool, screener,
            assessment platform, interviewer, CRM and analytics suite.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.title}
                className="group relative rounded-2xl border border-border bg-card/40 p-6 hover:bg-card/80 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
