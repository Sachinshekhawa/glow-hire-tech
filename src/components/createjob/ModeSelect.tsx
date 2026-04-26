import { MessagesSquare, Sparkles, Upload, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export type CreateMode = "chat" | "prompt" | "upload";

const options: {
  id: CreateMode;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof MessagesSquare;
  badge: string;
}[] = [
  {
    id: "chat",
    title: "Chat with AI",
    subtitle: "Answer a few quick questions",
    description:
      "Have a guided conversation. Glohire AI asks the right questions and drafts the JD as you go.",
    icon: MessagesSquare,
    badge: "Most popular",
  },
  {
    id: "prompt",
    title: "Write a prompt",
    subtitle: "Describe the role in your own words",
    description:
      "Type one rich prompt — e.g. \"Senior Java developer, full-time, Bangalore, 2 openings, Spring + Kubernetes\". We extract the rest.",
    icon: Sparkles,
    badge: "Fastest",
  },
  {
    id: "upload",
    title: "Upload or paste JD",
    subtitle: "PDF, Word, audio, or paste text",
    description:
      "Already have a job description? Upload a file or paste the content and we'll create the job from it.",
    icon: Upload,
    badge: "Bring your own",
  },
];

export const ModeSelect = ({
  onSelect,
}: {
  onSelect: (mode: CreateMode) => void;
}) => {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Create a new job
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          How would you like to create this job?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Pick the way that fits your workflow. You'll review the JD and capture
          client details before publishing.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="group text-left"
            >
              <Card className="relative h-full overflow-hidden border-border/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {opt.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-primary mt-0.5">{opt.subtitle}</p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {opt.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Continue
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
};
