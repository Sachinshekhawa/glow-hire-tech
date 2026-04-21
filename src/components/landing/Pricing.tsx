import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$199",
    period: "/mo",
    desc: "For growing teams making their first AI hires.",
    features: [
      "Up to 10 active jobs",
      "AI sourcing (1,000 profiles/mo)",
      "Email + SMS outreach",
      "Basic ATS dashboard",
      "Email support",
    ],
    cta: "Start free trial",
    variant: "outline-glow" as const,
  },
  {
    name: "Growth",
    price: "$799",
    period: "/mo",
    desc: "For scaling teams that need full automation.",
    features: [
      "Unlimited active jobs",
      "AI sourcing (10,000 profiles/mo)",
      "Multi-channel inbox (WhatsApp, LinkedIn)",
      "AI video interviews + assessments",
      "Workflow automation",
      "Priority support",
    ],
    cta: "Start free trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For global hiring orgs with custom needs.",
    features: [
      "Unlimited everything",
      "Dedicated AI models",
      "SSO, SCIM, audit logs",
      "Custom integrations & API",
      "SOC 2, GDPR, DPA",
      "Dedicated CSM + 24/7 support",
    ],
    cta: "Talk to sales",
    variant: "outline-glow" as const,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Pricing
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Pick a plan. <span className="gradient-text">Scale on demand.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            All plans include the AI recruiter, unified inbox and unlimited users.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative glass-card rounded-2xl p-8 flex flex-col ${
                t.popular ? "border-primary/60 shadow-glow" : ""
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                <span className="text-muted-foreground">{t.period}</span>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={t.variant} size="lg" className="mt-8 w-full" asChild>
                <a href="#cta">{t.cta}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
