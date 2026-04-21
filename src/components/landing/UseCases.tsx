import { Building2, Briefcase, Cpu, Users } from "lucide-react";

const cases = [
  {
    icon: Building2,
    title: "Staffing Agencies",
    desc: "Place candidates 5× faster with AI sourcing and automated multi-client pipelines.",
    tag: "High volume",
  },
  {
    icon: Briefcase,
    title: "Enterprise HR",
    desc: "Standardize hiring across regions, business units and time zones — with full audit trails.",
    tag: "Compliance",
  },
  {
    icon: Cpu,
    title: "Tech Hiring",
    desc: "Auto-evaluated coding tests, AI tech interviews and engineering scorecards out of the box.",
    tag: "Engineering",
  },
  {
    icon: Users,
    title: "Volume Hiring",
    desc: "Screen 10,000 applicants in hours with AI ranking, assessments and bulk outreach.",
    tag: "Scale",
  },
];

const UseCases = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Built for
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            One platform. <span className="gradient-text">Every hiring team.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary border border-border">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                    {c.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
