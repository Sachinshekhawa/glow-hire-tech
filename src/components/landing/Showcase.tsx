import { useState } from "react";
import dashboardImg from "@/assets/dashboard-mockup.jpg";
import inboxImg from "@/assets/inbox-mockup.jpg";
import interviewImg from "@/assets/interview-mockup.jpg";
import { LayoutDashboard, MessageSquare, Video } from "lucide-react";

const tabs = [
  {
    id: "ats",
    label: "ATS Dashboard",
    icon: LayoutDashboard,
    title: "Pipeline you can actually see",
    desc: "Track every candidate, every stage, every signal. Your entire hiring funnel in one command center.",
    img: dashboardImg,
  },
  {
    id: "inbox",
    label: "Unified Inbox",
    icon: MessageSquare,
    title: "Every conversation in one place",
    desc: "Email, WhatsApp, SMS, LinkedIn and AI chat — unified into a single thread per candidate.",
    img: inboxImg,
  },
  {
    id: "interview",
    label: "AI Interview",
    icon: Video,
    title: "Interview at infinite scale",
    desc: "Voice and video interviews powered by AI with sentiment analysis, transcripts and proctoring.",
    img: interviewImg,
  },
];

const Showcase = () => {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section id="showcase" className="py-24 md:py-32 section-glow">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Product
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            One platform. <span className="gradient-text">Every hiring surface.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            From kanban pipelines to AI interviews, Glohire replaces a stack of
            6+ tools with one beautifully connected workspace.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 mx-auto max-w-6xl">
          <div className="glass-card rounded-3xl p-3 md:p-4 shadow-elegant relative overflow-hidden">
            <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-20 blur-2xl -z-10" />
            <img
              key={current.id}
              src={current.img}
              alt={current.title}
              width={1600}
              height={1024}
              loading="lazy"
              className="rounded-2xl w-full h-auto animate-fade-in"
            />
          </div>

          <div className="mt-8 mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl md:text-3xl font-semibold">
              {current.title}
            </h3>
            <p className="mt-3 text-muted-foreground">{current.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
