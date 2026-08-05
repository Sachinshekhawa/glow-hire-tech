import { useState } from "react";
import {
  Inbox,
  FileSearch,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  Gauge,
  PhoneCall,
  UserCheck,
  Video,
  ClipboardCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import CtaForm from "@/components/landing/CtaForm";
import FloatingAssistant from "@/components/landing/FloatingAssistant";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

type StepKind = "agent" | "human" | "system";

interface Step {
  icon: LucideIcon;
  title: string;
  detail: string;
  kind: StepKind;
}

interface Stage {
  id: string;
  index: number;
  agent: string;
  tagline: string;
  accent: string;
  icon: LucideIcon;
  trigger: string;
  cadence: string;
  outputs: string[];
  steps: Step[];
}

const STAGES: Stage[] = [
  {
    id: "intake",
    index: 1,
    agent: "Job Intake Agent",
    tagline: "Inbox monitoring, intent classification & job creation",
    accent: "from-blue-500 to-indigo-500",
    icon: Inbox,
    trigger: "New email lands in the Account Manager inbox",
    cadence: "Real-time (on email receipt)",
    outputs: ["Parsed job record", "Confidence score", "Draft job or missing-info email"],
    steps: [
      { icon: Inbox, title: "Watch the AM inbox", detail: "The agent monitors the Account Manager's mailbox and picks up every incoming message with or without attachments.", kind: "agent" },
      { icon: FileSearch, title: "Intent classification", detail: "Each mail and attachment is classified — only genuine job requirements move forward. Invoices, chatter and marketing mails are discarded.", kind: "agent" },
      { icon: Gauge, title: "Parse & score confidence", detail: "Title, client, location, experience, skills, comp band and employment type are extracted, each with a confidence score against the benchmark threshold.", kind: "agent" },
      { icon: CheckCircle2, title: "Benchmark passed → auto-create job", detail: "When the confidence score clears the benchmark, the job is created directly inside Glohire and published to the pipeline.", kind: "system" },
      { icon: AlertTriangle, title: "Below benchmark → missing information", detail: "If mandatory fields are missing, the job is kept as a draft and a structured email listing the gaps is triggered to the Account Manager.", kind: "system" },
      { icon: Mail, title: "AM reverts & publishes", detail: "The Account Manager replies on the mail or logs into Glohire, opens the draft job, fills the gaps and publishes it.", kind: "human" },
    ],
  },
  {
    id: "sourcing",
    index: 2,
    agent: "Sourcing Swan",
    tagline: "Search strings, multi-portal sourcing & match scoring",
    accent: "from-emerald-500 to-teal-500",
    icon: Search,
    trigger: "A job is published in Glohire",
    cadence: "Recurring sweep every 30–60 minutes",
    outputs: ["Boolean search strings", "Candidate queue", "Ranked match scores"],
    steps: [
      { icon: Search, title: "Build the search string", detail: "The agent converts the job description into optimised boolean / semantic search strings per portal syntax.", kind: "agent" },
      { icon: Users, title: "Sweep integrated portals", detail: "It searches every connected job board and database and returns the top 10 candidates from each portal.", kind: "agent" },
      { icon: RefreshCw, title: "Push to the candidate queue", detail: "All sourced profiles land in a unified candidate queue with de-duplication across portals.", kind: "system" },
      { icon: Gauge, title: "Matching engine ranking", detail: "The matching engine scores every queued candidate against the JD and returns the top matches with a match score and rationale.", kind: "agent" },
      { icon: RefreshCw, title: "Runs on a 30/60 min loop", detail: "The sourcing + matching cycle repeats on schedule so the pipeline keeps refreshing until the role is filled.", kind: "system" },
    ],
  },
  {
    id: "botcall",
    index: 3,
    agent: "Bot Calling Agent",
    tagline: "Automated screening calls with human-in-the-loop review",
    accent: "from-amber-500 to-orange-500",
    icon: PhoneCall,
    trigger: "Matched candidates returned by Sourcing Swan",
    cadence: "Triggered per matched batch",
    outputs: ["Call transcripts", "Screening answers", "Shortlist for AI interview"],
    steps: [
      { icon: PhoneCall, title: "Initiate bot calls", detail: "An AI voice bot calls every matched candidate and runs the basic screening script — availability, notice period, comp expectation and must-have skills.", kind: "agent" },
      { icon: ClipboardCheck, title: "Capture responses", detail: "Answers, transcript, sentiment and engagement signals are recorded against the candidate profile.", kind: "agent" },
      { icon: UserCheck, title: "Human in the loop", detail: "A recruiter reviews the captured responses and decides which candidates move ahead to the next level.", kind: "human" },
    ],
  },
  {
    id: "aiinterview",
    index: 4,
    agent: "AI Interview Agent",
    tagline: "Interview invites, reports & manager review",
    accent: "from-purple-500 to-fuchsia-500",
    icon: Video,
    trigger: "Recruiter shortlists candidates after bot screening",
    cadence: "Triggered on shortlist",
    outputs: ["Interview invites", "Interview report", "Next-stage decision"],
    steps: [
      { icon: Mail, title: "Send AI interview invites", detail: "Every shortlisted candidate receives an AI interview invite with a scheduling link and role-specific instructions.", kind: "agent" },
      { icon: Video, title: "Conduct the AI interview", detail: "The agent runs the structured interview, adapting follow-up questions to the candidate's skills and experience.", kind: "agent" },
      { icon: ClipboardCheck, title: "Generate interview report", detail: "A scored report is produced covering competency ratings, communication, red flags and a recommendation.", kind: "agent" },
      { icon: UserCheck, title: "Manager review & progression", detail: "The recruiter or manager reviews the report and moves the candidate to client submission or the next interview round.", kind: "human" },
    ],
  },
];

const kindStyles: Record<StepKind, { label: string; className: string }> = {
  agent: { label: "Agent", className: "bg-primary/10 text-primary border-primary/20" },
  human: { label: "Human", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  system: { label: "System", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

const outcomes = [
  { icon: Clock, title: "Job live in minutes", desc: "Requirement mails become published, scored jobs without a recruiter touching a form." },
  { icon: Workflow, title: "Always-on pipeline", desc: "Sourcing and matching re-run every 30–60 minutes until the role closes." },
  { icon: PhoneCall, title: "Every candidate contacted", desc: "Voice screening reaches 100% of matched profiles — no missed follow-ups." },
  { icon: ShieldCheck, title: "Humans own decisions", desc: "Recruiters and managers approve at each gate; agents never advance a candidate alone." },
];

const AgenticAi = () => {
  const [active, setActive] = useState<string>(STAGES[0].id);
  const stage = STAGES.find((s) => s.id === active)!;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
          </div>
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Agentic AI Solutions
              </div>
              <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                Four agents that run a role{" "}
                <span className="gradient-text">from inbox to offer.</span>
              </h1>
              <p className="mt-5 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Glohire's agentic workflow picks up the requirement email, creates the job, sources and
                ranks candidates, screens them on a voice call and runs the AI interview — with humans
                approving every decision gate.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" asChild>
                  <a href="#cta">Book a Demo <ArrowRight className="h-5 w-5" /></a>
                </Button>
                <Button variant="outline-glow" size="xl" asChild>
                  <a href="#workflow">See the workflow</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="py-16 md:py-20 border-t border-border">
          <div className="container grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {outcomes.map((o) => {
              const Icon = o.icon;
              return (
                <div key={o.title} className="rounded-2xl border border-border bg-card/40 p-6 hover:bg-card/80 transition-colors">
                  <Icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{o.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow explorer */}
        <section id="workflow" className="py-20 md:py-28 border-t border-border">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The workflow</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                Handoffs, not <span className="gradient-text">hand-holding.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Select a stage to see its trigger, cadence, step-by-step run and the outputs it hands to the next agent.
              </p>
            </div>

            <div className="mt-14 flex flex-col lg:flex-row lg:items-stretch gap-3">
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                const isActive = s.id === active;
                return (
                  <div key={s.id} className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => setActive(s.id)}
                      className={cn(
                        "group relative flex-1 text-left rounded-2xl border p-4 transition-all overflow-hidden",
                        isActive ? "border-primary/50 bg-card shadow-elegant" : "border-border bg-card/60 hover:border-primary/30",
                      )}
                    >
                      <div className={cn("absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl transition-opacity", s.accent, isActive ? "opacity-25" : "opacity-10 group-hover:opacity-20")} />
                      <div className="relative flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", s.accent)}>
                          <Icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Step {s.index}</p>
                          <p className="font-semibold text-sm truncate">{s.agent}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{s.tagline}</p>
                        </div>
                      </div>
                    </button>
                    {i < STAGES.length - 1 && (
                      <ArrowRight className="hidden lg:block h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br", stage.accent)}>
                    <stage.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{stage.agent}</h3>
                    <p className="text-sm text-muted-foreground">{stage.tagline}</p>
                  </div>
                </div>

                <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-border">
                  {stage.steps.map((st) => {
                    const Icon = st.icon;
                    const k = kindStyles[st.kind];
                    return (
                      <li key={st.title} className="relative flex gap-4">
                        <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                          <Icon className="h-4 w-4 text-primary" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-sm">{st.title}</p>
                            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", k.className)}>
                              {k.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{st.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card/40 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Trigger</p>
                  <p className="mt-2 text-sm">{stage.trigger}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/40 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cadence</p>
                  <p className="mt-2 text-sm">{stage.cadence}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/40 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Outputs</p>
                  <ul className="mt-3 space-y-2">
                    {stage.outputs.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full detail */}
        <section className="py-20 md:py-28 border-t border-border">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">In detail</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                Every step, <span className="gradient-text">documented.</span>
              </h2>
            </div>

            <div className="mt-14 space-y-6">
              {STAGES.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", s.accent)}>
                      <s.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Stage {s.index}</p>
                      <h3 className="font-display text-xl font-semibold">{s.agent}</h3>
                    </div>
                  </div>
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    {s.steps.map((st) => {
                      const k = kindStyles[st.kind];
                      return (
                        <div key={st.title} className="rounded-xl border border-border bg-background/40 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <st.icon className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">{st.title}</p>
                            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", k.className)}>
                              {k.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{st.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CtaForm />
      </main>

      <Footer />
      <FloatingAssistant />
    </div>
  );
};

export default AgenticAi;
