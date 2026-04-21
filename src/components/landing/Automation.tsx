import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import workflowImg from "@/assets/workflow-mockup.jpg";

const Automation = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
              <Zap className="h-3.5 w-3.5" />
              Workflow Automation
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Set it once. <br />
              <span className="gradient-text">Hire automatically.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Drag-and-drop your hiring process. Trigger AI screening, send assessments,
              schedule interviews and move candidates — all without lifting a finger.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Visual workflow builder with 60+ triggers",
                "AI decision nodes (auto-advance or reject)",
                "Conditional branching based on candidate signals",
                "Native integrations: Slack, Calendar, HRIS, Stripe",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>

            <Button variant="hero" size="lg" className="mt-8" asChild>
              <a href="#cta">
                Build your workflow
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-accent/20 blur-3xl rounded-3xl" />
            <div className="relative glass-card rounded-2xl p-2 shadow-elegant">
              <img
                src={workflowImg}
                alt="Glohire drag-and-drop workflow builder"
                width={1600}
                height={900}
                loading="lazy"
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Automation;
