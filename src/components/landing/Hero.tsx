import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Introducing Glohire AI Recruiter v3
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="text-primary">Now live</span>
          </div>

          <h1 className="mt-8 font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            The Future of Hiring is{" "}
            <span className="gradient-text">Autonomous</span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            An AI recruiter, multi-channel engagement hub, and end-to-end ATS — unified
            on one platform. Glohire sources, screens, interviews and hires while
            your team sleeps.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#cta">
                Book a Demo
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline-glow" size="xl" asChild>
              <a href="#showcase">
                <PlayCircle className="h-5 w-5" />
                Watch Product Tour
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
              No credit card required
            </span>
            <span>14-day free trial</span>
            <span>SOC 2 & GDPR ready</span>
          </div>
        </div>

        {/* Floating stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up">
          {[
            { v: "70%", l: "Faster hiring" },
            { v: "50%", l: "Cost reduction" },
            { v: "3×", l: "Engagement rate" },
            { v: "24/7", l: "AI recruiter" },
          ].map((s) => (
            <div
              key={s.l}
              className="glass-card rounded-2xl p-5 text-center hover:border-primary/40 transition-colors"
            >
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
                {s.v}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
