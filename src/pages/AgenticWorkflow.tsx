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
  type LucideIcon,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

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
      {
        icon: Inbox,
        title: "Watch the AM inbox",
        detail:
          "The agent monitors the Account Manager's mailbox and picks up every incoming message with or without attachments.",
        kind: "agent",
      },
      {
        icon: FileSearch,
        title: "Intent classification",
        detail:
          "Each mail and attachment is classified — only genuine job requirements move forward. Invoices, chatter and marketing mails are discarded.",
        kind: "agent",
      },
      {
        icon: Gauge,
        title: "Parse & score confidence",
        detail:
          "Title, client, location, experience, skills, comp band and employment type are extracted, each with a confidence score against the benchmark threshold.",
        kind: "agent",
      },
      {
        icon: CheckCircle2,
        title: "Benchmark passed → auto-create job",
        detail:
          "When the confidence score clears the benchmark, the job is created directly inside Glohire and published to the pipeline.",
        kind: "system",
      },
      {
        icon: AlertTriangle,
        title: "Below benchmark → missing information",
        detail:
          "If mandatory fields are missing, the job is kept as a draft and a structured email listing the gaps is triggered to the Account Manager.",
        kind: "system",
      },
      {
        icon: Mail,
        title: "AM reverts & publishes",
        detail:
          "The Account Manager replies on the mail or logs into Glohire, opens the draft job, fills the gaps and publishes it.",
        kind: "human",
      },
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
      {
        icon: Search,
        title: "Build the search string",
        detail:
          "The agent converts the job description into optimised boolean / semantic search strings per portal syntax.",
        kind: "agent",
      },
      {
        icon: Users,
        title: "Sweep integrated portals",
        detail:
          "It searches every connected job board and database and returns the top 10 candidates from each portal.",
        kind: "agent",
      },
      {
        icon: RefreshCw,
        title: "Push to the candidate queue",
        detail:
          "All sourced profiles land in a unified candidate queue with de-duplication across portals.",
        kind: "system",
      },
      {
        icon: Gauge,
        title: "Matching engine ranking",
        detail:
          "The matching engine scores every queued candidate against the JD and returns the top matches with a match score and rationale.",
        kind: "agent",
      },
      {
        icon: RefreshCw,
        title: "Runs on a 30/60 min loop",
        detail:
          "The sourcing + matching cycle repeats on schedule so the pipeline keeps refreshing until the role is filled.",
        kind: "system",
      },
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
      {
        icon: PhoneCall,
        title: "Initiate bot calls",
        detail:
          "An AI voice bot calls every matched candidate and runs the basic screening script — availability, notice period, comp expectation and must-have skills.",
        kind: "agent",
      },
      {
        icon: ClipboardCheck,
        title: "Capture responses",
        detail:
          "Answers, transcript, sentiment and engagement signals are recorded against the candidate profile.",
        kind: "agent",
      },
      {
        icon: UserCheck,
        title: "Human in the loop",
        detail:
          "A recruiter reviews the captured responses and decides which candidates move ahead to the next level.",
        kind: "human",
      },
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
      {
        icon: Mail,
        title: "Send AI interview invites",
        detail:
          "Every shortlisted candidate receives an AI interview invite with a scheduling link and role-specific instructions.",
        kind: "agent",
      },
      {
        icon: Video,
        title: "Conduct the AI interview",
        detail:
          "The agent runs the structured interview, adapting follow-up questions to the candidate's skills and experience.",
        kind: "agent",
      },
      {
        icon: ClipboardCheck,
        title: "Generate interview report",
        detail:
          "A scored report is produced covering competency ratings, communication, red flags and a recommendation.",
        kind: "agent",
      },
      {
        icon: UserCheck,
        title: "Manager review & progression",
        detail:
          "The recruiter or manager reviews the report and moves the candidate to client submission or the next interview round.",
        kind: "human",
      },
    ],
  },
];

const kindStyles: Record<StepKind, { label: string; className: string }> = {
  agent: { label: "Agent", className: "bg-primary/10 text-primary border-primary/20" },
  human: { label: "Human", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  system: { label: "System", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

const AgenticWorkflow = () => {
  const [active, setActive] = useState<string>(STAGES[0].id);
  const stage = STAGES.find((s) => s.id === active)!;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Agentic workflow
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            How <span className="gradient-text">Glohire</span> runs a role end to end
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Four agents hand work to each other — from an email landing in the Account Manager's inbox
            to an interview report ready for manager review. Humans stay in the loop at every decision gate.
          </p>
        </header>

        {/* Flow rail */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === active;
            return (
              <div key={s.id} className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "group relative flex-1 text-left rounded-2xl border p-4 transition-all overflow-hidden",
                    isActive
                      ? "border-primary/50 bg-card shadow-elegant"
                      : "border-border bg-card/60 hover:border-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl transition-opacity",
                      s.accent,
                      isActive ? "opacity-25" : "opacity-10 group-hover:opacity-20",
                    )}
                  />
                  <div className="relative flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                        s.accent,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Step {s.index}
                      </p>
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

        {/* Detail panel */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                  stage.accent,
                )}
              >
                <stage.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">{stage.agent}</h2>
                <p className="text-sm text-muted-foreground">{stage.tagline}</p>
              </div>
            </div>

            <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-border">
              {stage.steps.map((step) => {
                const Icon = step.icon;
                const meta = kindStyles[step.kind];
                return (
                  <li key={step.title} className="relative flex gap-4">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{step.title}</p>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trigger</p>
              <p className="text-sm mt-1">{stage.trigger}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cadence</p>
              <p className="text-sm mt-1">{stage.cadence}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Outputs</p>
              <ul className="space-y-1.5">
                {stage.outputs.map((o) => (
                  <li key={o} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Handoff</p>
              <p className="text-sm text-muted-foreground">
                {stage.index < STAGES.length
                  ? `Passes control to ${STAGES[stage.index].agent}.`
                  : "Final stage — candidate moves to client submission or offer."}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AgenticWorkflow;
