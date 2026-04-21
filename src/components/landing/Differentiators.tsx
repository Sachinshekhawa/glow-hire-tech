import { Brain, MessageSquareMore, Workflow, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: Brain,
    title: "AI-first, not AI-bolted-on",
    desc: "Built from day one around large language and matching models — not a legacy ATS with a chatbot stapled on.",
  },
  {
    icon: MessageSquareMore,
    title: "True multi-channel engagement",
    desc: "Reach candidates on Email, WhatsApp, SMS, LinkedIn and in-app chat from one unified inbox.",
  },
  {
    icon: Workflow,
    title: "Fully automated workflows",
    desc: "Trigger assessments, schedule interviews and move candidates through the funnel with zero clicks.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud-proof hiring",
    desc: "AI proctoring, behavioral analysis and identity verification keep your pipeline clean and trustworthy.",
  },
];

const Differentiators = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-glow opacity-40 -z-10" />
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Why Glohire
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Built differently. <span className="gradient-text">Hires differently.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Differentiators;
