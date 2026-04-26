import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Building2,
  Check,
  Copy,
  Download,
  Pencil,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Sparkle,
  User,
  UserRound,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

import { ChatQuestion, Condition } from "@/data/chatQuestions";
import { loadQuestions } from "@/data/chatQuestionsStore";
import { extractAnswersFromText } from "@/data/answerExtractor";
import { Client, POC } from "@/data/clients";
import { loadClients } from "@/data/clientsStore";
import {
  ClientCondition,
  ClientQuestion,
} from "@/data/clientQuestions";
import { loadClientQuestions } from "@/data/clientQuestionsStore";
import { ModeSelect, type CreateMode } from "@/components/createjob/ModeSelect";
import { PromptMode } from "@/components/createjob/PromptMode";
import { UploadMode } from "@/components/createjob/UploadMode";

type Phase = "job" | "client";

type ChatMessage =
  | {
      id: string;
      role: "assistant";
      kind: "question";
      phase: Phase;
      questionId: string;
      text: string;
    }
  | { id: string; role: "assistant"; kind: "info"; text: string }
  | { id: string; role: "assistant"; kind: "jd"; text: string }
  | {
      id: string;
      role: "user";
      phase: Phase;
      text: string;
      questionId: string;
    };

type Answers = Record<string, string | string[]>;

const conditionPasses = (
  cond: Condition | ClientCondition,
  answers: Answers,
): boolean => {
  const ans = answers[cond.ifQuestionId];
  if (ans == null) return false;
  if (Array.isArray(ans)) {
    return cond.operator === "contains"
      ? ans.some((a) => a.toLowerCase().includes(cond.value.toLowerCase()))
      : ans.includes(cond.value);
  }
  return cond.operator === "contains"
    ? ans.toLowerCase().includes(cond.value.toLowerCase())
    : ans.toLowerCase() === cond.value.toLowerCase();
};

const isJobQuestionEligible = (q: ChatQuestion, answers: Answers): boolean => {
  if (!q.active) return false;
  if (!q.conditions || q.conditions.length === 0) return true;
  return q.conditions.some((c) => conditionPasses(c, answers));
};

const isClientQuestionEligible = (
  q: ClientQuestion,
  answers: Answers,
): boolean => {
  if (!q.active) return false;
  if (!q.conditions || q.conditions.length === 0) return true;
  return q.conditions.some((c) => conditionPasses(c, answers));
};

const buildJD = (questions: ChatQuestion[], answers: Answers): string => {
  const get = (id: string) => answers[id];
  const title = (get("q-1") as string) || "Open Role";
  const dept = (get("q-2") as string) || "";
  const employment = (get("q-5") as string) || "";
  const location = (get("q-6") as string) || "";
  const positions = (get("q-8") as string) || "";
  const skills = get("q-4");
  const salary = (get("q-7") as string) || "";

  const lines: string[] = [];
  lines.push(`# ${title}`);
  if (dept) lines.push(`**Department:** ${dept}`);
  if (employment) lines.push(`**Employment Type:** ${employment}`);
  if (location) lines.push(`**Location:** ${location}`);
  if (positions) lines.push(`**Open Positions:** ${positions}`);
  if (salary) lines.push(`**Salary Range:** ${salary}`);

  lines.push("");
  lines.push("## About the Role");
  lines.push(
    `We are hiring a ${title}${dept ? ` in our ${dept} team` : ""}${
      location ? ` (${location})` : ""
    }. Join us to do meaningful work alongside a talented, mission-driven team.`,
  );

  if (Array.isArray(skills) && skills.length > 0) {
    lines.push("");
    lines.push("## Required Skills");
    skills.forEach((s) => lines.push(`- ${s}`));
  }

  const handled = new Set(["q-1", "q-2", "q-4", "q-5", "q-6", "q-7", "q-8"]);
  const extras = questions.filter(
    (q) => !handled.has(q.id) && answers[q.id] != null,
  );
  if (extras.length > 0) {
    lines.push("");
    lines.push("## Additional Details");
    extras.forEach((q) => {
      const a = answers[q.id];
      const v = Array.isArray(a) ? a.join(", ") : a;
      lines.push(`- **${q.text}** ${v}`);
    });
  }

  lines.push("");
  lines.push("## What You'll Do");
  lines.push("- Partner with cross-functional teams to ship high-impact work");
  lines.push("- Own outcomes end-to-end and raise the bar for quality");
  lines.push("- Continuously learn, mentor, and grow with the team");

  lines.push("");
  lines.push("## How to Apply");
  lines.push(
    "Submit your application through Glohire — our AI will guide you through a quick screening conversation.",
  );

  return lines.join("\n");
};

const uid = () => Math.random().toString(36).slice(2, 10);

const formatAnswerForDisplay = (
  q: ClientQuestion,
  value: string | string[],
  clients: Client[],
): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (q.inputType === "client_picker") {
    const c = clients.find((c) => c.id === value);
    return c ? c.name : value;
  }
  if (q.inputType === "poc_picker") {
    for (const c of clients) {
      const p = c.pocs.find((p) => p.id === value);
      if (p) return `${p.name}${p.designation ? ` · ${p.designation}` : ""}`;
    }
    return value;
  }
  if (q.inputType === "currency" && value) {
    return value.startsWith("$") ? value : `$${value}`;
  }
  return value || "(skipped)";
};

const CreateJob = () => {
  const { toast } = useToast();
  const [questions] = useState<ChatQuestion[]>(() => loadQuestions());
  const [clientQuestions] = useState<ClientQuestion[]>(() =>
    loadClientQuestions(),
  );
  const [clients] = useState<Client[]>(() => loadClients());
  const [answers, setAnswers] = useState<Answers>({});
  const [clientAnswers, setClientAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [multiPick, setMultiPick] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("job");
  const [completed, setCompleted] = useState(false); // both phases done
  const [editingId, setEditingId] = useState<string | null>(null); // job-question edit
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [autoFilledIds, setAutoFilledIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<CreateMode | "select">("select");
  const [jdOverride, setJdOverride] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Eligible job-question pipeline
  const eligibleQueue = useMemo(
    () =>
      [...questions]
        .sort((a, b) => a.order - b.order)
        .filter((q) => isJobQuestionEligible(q, answers)),
    [questions, answers],
  );

  // Eligible client-question pipeline (computed against client answers)
  const eligibleClientQueue = useMemo(
    () =>
      [...clientQuestions]
        .sort((a, b) => a.order - b.order)
        .filter((q) => isClientQuestionEligible(q, clientAnswers)),
    [clientQuestions, clientAnswers],
  );

  const askedIds = useMemo(
    () =>
      new Set(
        messages
          .filter(
            (m) =>
              m.role === "assistant" && (m as any).kind === "question",
          )
          .map((m) => (m as any).questionId as string),
      ),
    [messages],
  );

  const currentJobQuestion = useMemo(() => {
    return eligibleQueue.find((q) => answers[q.id] == null) || null;
  }, [eligibleQueue, answers]);

  const currentClientQuestion = useMemo(() => {
    return (
      eligibleClientQueue.find((q) => clientAnswers[q.id] == null) || null
    );
  }, [eligibleClientQueue, clientAnswers]);

  const jobPhaseDone = phase === "job" && currentJobQuestion == null;

  // Initial greeting (only relevant for chat mode)
  useEffect(() => {
    if (mode !== "chat") return;
    if (messages.length === 0) {
      const intro: ChatMessage = {
        id: uid(),
        role: "assistant",
        kind: "info",
        text:
          "Hi 👋 I'm your Glohire assistant. I'll ask a few quick questions and draft a polished job description for you.",
      };
      setMessages([intro]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Push the next JOB question into chat (chat mode only)
  useEffect(() => {
    if (mode !== "chat") return;
    if (phase !== "job") return;
    if (!currentJobQuestion) {
      // Job phase finished — generate JD then transition to client phase
      if (Object.keys(answers).length === 0) return;
      const jd = buildJD(questions, answers);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          kind: "info",
          text: "Perfect — I have everything I need for the JD. Here's your draft ✨",
        },
        { id: uid(), role: "assistant", kind: "jd", text: jd },
        {
          id: uid(),
          role: "assistant",
          kind: "info",
          text:
            clients.length === 0
              ? "Your client directory is empty — add clients in the admin to capture commercial details."
              : "Now let's capture the client & commercial details for this job. These stay internal and won't appear in the JD.",
        },
      ]);
      setPhase("client");
      return;
    }
    if (askedIds.has(currentJobQuestion.id)) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "assistant",
        kind: "question",
        phase: "job",
        questionId: currentJobQuestion.id,
        text: currentJobQuestion.text,
      },
    ]);
    setMultiPick([]);
    setTextInput("");
  }, [currentJobQuestion, askedIds, answers, questions, phase, clients.length, mode]);

  // Push the next CLIENT question into chat
  useEffect(() => {
    if (phase !== "client") return;
    if (!currentClientQuestion) {
      if (
        eligibleClientQueue.length > 0 &&
        Object.keys(clientAnswers).length > 0 &&
        !completed
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            kind: "info",
            text: "All set! Client & commercial details are saved. You can download the internal sheet anytime below.",
          },
        ]);
        setCompleted(true);
      } else if (eligibleClientQueue.length === 0 && !completed) {
        // No active client questions configured — mark completed silently
        setCompleted(true);
      }
      return;
    }
    if (askedIds.has(currentClientQuestion.id)) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "assistant",
        kind: "question",
        phase: "client",
        questionId: currentClientQuestion.id,
        text: currentClientQuestion.text,
      },
    ]);
    setMultiPick([]);
    setTextInput("");
  }, [
    currentClientQuestion,
    askedIds,
    clientAnswers,
    phase,
    eligibleClientQueue.length,
    completed,
  ]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, currentJobQuestion, currentClientQuestion]);

  // Resolve the selected client id from client answers — needed for poc_picker
  const selectedClientIdForPoc = useMemo(() => {
    const clientPickerQ = clientQuestions.find(
      (q) => q.inputType === "client_picker",
    );
    if (!clientPickerQ) return "";
    const v = clientAnswers[clientPickerQ.id];
    return typeof v === "string" ? v : "";
  }, [clientQuestions, clientAnswers]);

  /* ---------- Job-phase handlers ---------- */

  const submitJobAnswer = (value: string | string[]) => {
    if (!currentJobQuestion) return;
    const display = Array.isArray(value) ? value.join(", ") : value;
    if (!display.trim() && currentJobQuestion.required) {
      toast({
        title: "Answer required",
        description: "This question is required to continue.",
        variant: "destructive",
      });
      return;
    }

    const isFreeText =
      currentJobQuestion.inputType === "free_text" &&
      typeof value === "string";
    const extras = isFreeText
      ? extractAnswersFromText(
          value as string,
          questions,
          currentJobQuestion.id,
        )
      : {};
    const newExtras: Record<string, string | string[]> = {};
    Object.entries(extras).forEach(([qid, v]) => {
      if (answers[qid] == null) newExtras[qid] = v;
    });

    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        phase: "job",
        text: display || "(skipped)",
        questionId: currentJobQuestion.id,
      },
    ]);
    setAnswers((prev) => ({
      ...prev,
      [currentJobQuestion.id]: value,
      ...newExtras,
    }));
    setTextInput("");
    setMultiPick([]);

    if (Object.keys(newExtras).length > 0) {
      setAutoFilledIds((prev) => {
        const next = new Set(prev);
        Object.keys(newExtras).forEach((id) => next.add(id));
        return next;
      });
      const labels = Object.keys(newExtras)
        .map((id) => questions.find((q) => q.id === id)?.text)
        .filter(Boolean) as string[];
      const previewMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        kind: "info",
        text: `✨ I picked up ${labels.length} more answer${
          labels.length === 1 ? "" : "s"
        } from your message:\n• ${labels.join("\n• ")}\n\nYou can edit any of them from the Live Summary panel before I generate the JD.`,
      };
      setMessages((prev) => [...prev, previewMsg]);
      toast({
        title: `Auto-filled ${labels.length} answer${labels.length === 1 ? "" : "s"}`,
        description: "Review or edit them anytime from the Live Summary.",
      });
    }
  };

  const skipJob = () => {
    if (!currentJobQuestion || currentJobQuestion.required) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        phase: "job",
        text: "(skipped)",
        questionId: currentJobQuestion.id,
      },
    ]);
    setAnswers((prev) => ({ ...prev, [currentJobQuestion.id]: "" }));
  };

  const updateJobAnswer = (qid: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setAutoFilledIds((prev) => {
      const next = new Set(prev);
      next.delete(qid);
      return next;
    });
    // Don't auto-rebuild a JD that came from an uploaded/pasted source
    if (jdOverride) {
      toast({ title: "Answer updated" });
      return;
    }
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => (m as any).kind === "jd");
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      const nextAnswers = { ...answers, [qid]: value };
      const jd = buildJD(questions, nextAnswers);
      const copy = [...prev];
      copy[realIdx] = { ...copy[realIdx], text: jd } as ChatMessage;
      return copy;
    });
    toast({ title: "Answer updated" });
  };

  /* ---------- Client-phase handlers ---------- */

  const submitClientAnswer = (value: string | string[]) => {
    if (!currentClientQuestion) return;
    const display = Array.isArray(value) ? value.join(", ") : value;
    if (!display.trim() && currentClientQuestion.required) {
      toast({
        title: "Answer required",
        description: "This question is required to continue.",
        variant: "destructive",
      });
      return;
    }

    const friendly = formatAnswerForDisplay(
      currentClientQuestion,
      value,
      clients,
    );

    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        phase: "client",
        text: friendly || "(skipped)",
        questionId: currentClientQuestion.id,
      },
    ]);
    setClientAnswers((prev) => ({
      ...prev,
      [currentClientQuestion.id]: value,
    }));
    setTextInput("");
    setMultiPick([]);
  };

  const skipClient = () => {
    if (!currentClientQuestion || currentClientQuestion.required) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        phase: "client",
        text: "(skipped)",
        questionId: currentClientQuestion.id,
      },
    ]);
    setClientAnswers((prev) => ({ ...prev, [currentClientQuestion.id]: "" }));
  };

  const updateClientAnswer = (qid: string, value: string | string[]) => {
    setClientAnswers((prev) => ({ ...prev, [qid]: value }));
    toast({ title: "Answer updated" });
  };

  /* ---------- Misc ---------- */

  const restart = () => {
    setAnswers({});
    setClientAnswers({});
    setMessages([]);
    setPhase("job");
    setCompleted(false);
    setTextInput("");
    setMultiPick([]);
    setAutoFilledIds(new Set());
    setEditingId(null);
    setEditingClientId(null);
    setMode("select");
    setJdOverride(null);
  };

  const changeMode = () => {
    // Allow user to swap mode before they've started the client phase
    setAnswers({});
    setMessages([]);
    setPhase("job");
    setCompleted(false);
    setTextInput("");
    setMultiPick([]);
    setAutoFilledIds(new Set());
    setJdOverride(null);
    setMode("select");
  };

  /**
   * Used by Prompt & Upload modes to seed the chat with a generated/imported
   * JD and jump directly into the client questionnaire phase.
   */
  const bootstrapFromAnswers = (
    seededAnswers: Answers,
    overrideJd: string | null,
  ) => {
    const sortedActive = [...questions]
      .sort((a, b) => a.order - b.order)
      .filter((q) => q.active && seededAnswers[q.id] != null);

    const seededMessages: ChatMessage[] = [];
    seededMessages.push({
      id: uid(),
      role: "assistant",
      kind: "info",
      text: overrideJd
        ? "Got it ✨ I imported your JD and pre-filled the structured fields below."
        : "Perfect — I generated everything from your prompt. Here's the draft ✨",
    });
    // Echo each captured answer as a chat exchange so the Live Summary edit
    // dialog and timeline make sense.
    sortedActive.forEach((q) => {
      seededMessages.push({
        id: uid(),
        role: "assistant",
        kind: "question",
        phase: "job",
        questionId: q.id,
        text: q.text,
      });
      const v = seededAnswers[q.id];
      const display = Array.isArray(v) ? v.join(", ") : (v as string);
      seededMessages.push({
        id: uid(),
        role: "user",
        phase: "job",
        questionId: q.id,
        text: display || "(skipped)",
      });
    });

    const jd = overrideJd || buildJD(questions, seededAnswers);
    seededMessages.push({ id: uid(), role: "assistant", kind: "jd", text: jd });
    seededMessages.push({
      id: uid(),
      role: "assistant",
      kind: "info",
      text:
        clients.length === 0
          ? "Your client directory is empty — add clients in the admin to capture commercial details."
          : "Now let's capture the client & commercial details for this job. These stay internal and won't appear in the JD.",
    });

    setAnswers(seededAnswers);
    setAutoFilledIds(new Set(sortedActive.map((q) => q.id)));
    setJdOverride(overrideJd);
    setMessages(seededMessages);
    setPhase("client");
    setMode("chat");
  };

  const totalActive =
    phase === "job"
      ? eligibleQueue.length || 1
      : eligibleClientQueue.length || 1;
  const answeredCount =
    phase === "job"
      ? eligibleQueue.filter((q) => answers[q.id] != null).length
      : eligibleClientQueue.filter((q) => clientAnswers[q.id] != null).length;
  const progress = Math.min(
    100,
    Math.round((answeredCount / totalActive) * 100),
  );

  const lastJd = [...messages].reverse().find((m) => (m as any).kind === "jd");

  const copyJD = async () => {
    if (!lastJd) return;
    await navigator.clipboard.writeText((lastJd as any).text);
    toast({
      title: "Copied",
      description: "Job description copied to clipboard.",
    });
  };

  const fileSlug =
    (answers["q-1"] as string)?.toLowerCase().replace(/\s+/g, "-") ||
    "job-description";

  const downloadJD = () => {
    if (!lastJd) return;
    const blob = new Blob([(lastJd as any).text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInternal = () => {
    const lines: string[] = [];
    lines.push(
      `# Internal: Client & Commercial — ${(answers["q-1"] as string) || "Job"}`,
    );
    lines.push("");
    lines.push("> Internal recruiter use only. Do NOT share with candidates.");
    lines.push("");
    lines.push("## Client questionnaire");
    eligibleClientQueue.forEach((q) => {
      const a = clientAnswers[q.id];
      if (a == null) return;
      const v = formatAnswerForDisplay(q, a, clients);
      lines.push(`- **${q.text}** ${v || "(skipped)"}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}-client-internal.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQuestion =
    phase === "job" ? currentJobQuestion : currentClientQuestion;
  const handleSubmit =
    phase === "job" ? submitJobAnswer : submitClientAnswer;
  const handleSkip = phase === "job" ? skipJob : skipClient;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <div>
                <h1 className="font-display text-base font-semibold leading-tight">
                  Create a Job
                </h1>
                <p className="text-xs text-muted-foreground">
                  {mode === "select"
                    ? "Pick how you'd like to create this job"
                    : mode === "prompt"
                      ? "Prompt-based job creation"
                      : mode === "upload"
                        ? "Upload or paste a JD"
                        : "Chat with Glohire AI to generate a JD"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode !== "select" && phase === "job" && !completed && (
              <Button variant="ghost" size="sm" onClick={changeMode}>
                <ArrowLeft className="h-4 w-4" />
                Change mode
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/system-behavior">
                <Settings2 className="h-4 w-4" />
                Manage Questions
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 lg:py-10">
        {mode === "select" && (
          <ModeSelect onSelect={(m) => setMode(m)} />
        )}

        {mode === "prompt" && (
          <PromptMode
            questions={questions}
            onBack={changeMode}
            onComplete={(seeded) => bootstrapFromAnswers(seeded, null)}
          />
        )}

        {mode === "upload" && (
          <UploadMode
            questions={questions}
            onBack={changeMode}
            onComplete={(seeded, jdText) =>
              bootstrapFromAnswers(seeded, jdText)
            }
          />
        )}

        {mode === "chat" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Chat column */}
          <Card className="relative overflow-hidden border-border/60">
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative flex flex-col h-[70vh] min-h-[520px]">
              {/* Progress */}
              <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Glohire Assistant
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      AI
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 border-primary/40 text-primary"
                    >
                      {phase === "job" ? (
                        <>
                          <Sparkles className="h-2.5 w-2.5" /> Step 1: JD
                        </>
                      ) : (
                        <>
                          <Building2 className="h-2.5 w-2.5" /> Step 2: Client
                        </>
                      )}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {answeredCount} / {totalActive} answered
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
              >
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>

              {/* Input area */}
              <div className="border-t border-border/60 bg-background/40 backdrop-blur-sm p-4">
                {completed ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      Job, JD &amp; client details saved
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyJD}>
                        <Copy className="h-4 w-4" /> Copy JD
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadJD}>
                        <Download className="h-4 w-4" /> Download JD
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadInternal}
                      >
                        <Download className="h-4 w-4" /> Internal sheet
                      </Button>
                      <Button variant="hero" size="sm" onClick={restart}>
                        <RefreshCw className="h-4 w-4" /> New Job
                      </Button>
                    </div>
                  </div>
                ) : currentQuestion ? (
                  phase === "job" ? (
                    <JobAnswerInput
                      key={currentQuestion.id}
                      question={currentQuestion as ChatQuestion}
                      textInput={textInput}
                      setTextInput={setTextInput}
                      multiPick={multiPick}
                      setMultiPick={setMultiPick}
                      onSubmit={handleSubmit}
                      onSkip={handleSkip}
                    />
                  ) : (
                    <ClientAnswerInput
                      key={currentQuestion.id}
                      question={currentQuestion as ClientQuestion}
                      textInput={textInput}
                      setTextInput={setTextInput}
                      multiPick={multiPick}
                      setMultiPick={setMultiPick}
                      onSubmit={handleSubmit}
                      onSkip={handleSkip}
                      clients={clients}
                      selectedClientIdForPoc={selectedClientIdForPoc}
                    />
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active questions configured for this step.{" "}
                    <Link
                      to={
                        phase === "job"
                          ? "/admin/system-behavior"
                          : "/admin/client-fields"
                      }
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Open admin
                    </Link>{" "}
                    to enable some.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Side panel: live summary */}
          <aside className="space-y-4">
            <Card className="p-5 border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">JD Summary</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Built from active questions in System Behavior.
              </p>
              <ul className="space-y-3">
                {eligibleQueue.map((q) => {
                  const a = answers[q.id];
                  const answered = a != null;
                  const display = Array.isArray(a)
                    ? a.join(", ")
                    : (a as string) || "—";
                  const wasAuto = autoFilledIds.has(q.id);
                  return (
                    <li key={q.id} className="text-sm group">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                            answered
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {answered ? <Check className="h-2.5 w-2.5" /> : "•"}
                        </span>
                        <span className="text-muted-foreground line-clamp-1 flex-1">
                          {q.text}
                        </span>
                        {wasAuto && (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-[9px] px-1.5 py-0 h-4 border border-primary/30 text-primary"
                          >
                            <Wand2 className="h-2.5 w-2.5" />
                            auto
                          </Badge>
                        )}
                        {answered && (
                          <button
                            onClick={() => setEditingId(q.id)}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex h-5 w-5 items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                            aria-label={`Edit answer for ${q.text}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {answered && (
                        <p className="ml-6 mt-1 text-foreground line-clamp-2">
                          {display || "(skipped)"}
                        </p>
                      )}
                    </li>
                  );
                })}
                {eligibleQueue.length === 0 && (
                  <li className="text-xs text-muted-foreground">
                    No active questions yet.
                  </li>
                )}
              </ul>
            </Card>

            {(jobPhaseDone || phase === "client" || completed) && (
              <Card className="p-5 border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Client Summary</h2>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] gap-1 border-primary/40 text-primary"
                  >
                    Internal
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Configurable from{" "}
                  <Link
                    to="/admin/client-fields"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Client questions admin
                  </Link>
                  .
                </p>
                <ul className="space-y-3">
                  {eligibleClientQueue.map((q) => {
                    const a = clientAnswers[q.id];
                    const answered = a != null;
                    const display = answered
                      ? formatAnswerForDisplay(q, a, clients)
                      : "—";
                    return (
                      <li key={q.id} className="text-sm group">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                              answered
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {answered ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : (
                              "•"
                            )}
                          </span>
                          <span className="text-muted-foreground line-clamp-1 flex-1">
                            {q.text}
                          </span>
                          {answered && (
                            <button
                              onClick={() => setEditingClientId(q.id)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex h-5 w-5 items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                              aria-label={`Edit answer for ${q.text}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {answered && (
                          <p className="ml-6 mt-1 text-foreground line-clamp-2">
                            {display || "(skipped)"}
                          </p>
                        )}
                      </li>
                    );
                  })}
                  {eligibleClientQueue.length === 0 && (
                    <li className="text-xs text-muted-foreground">
                      No active client questions configured.
                    </li>
                  )}
                </ul>
              </Card>
            )}

            <Card className="p-5 border-border/60">
              <h3 className="text-sm font-semibold mb-2">Tip</h3>
              <p className="text-xs text-muted-foreground">
                Toggle questions on/off or add new ones from{" "}
                <Link
                  to="/admin/system-behavior"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Manage Questions
                </Link>
                . The chat updates instantly.
              </p>
            </Card>
          </aside>
        </div>
      </main>

      {/* Edit JOB answer */}
      <EditJobAnswerDialog
        question={
          editingId ? questions.find((q) => q.id === editingId) || null : null
        }
        currentValue={editingId ? answers[editingId] : undefined}
        onClose={() => setEditingId(null)}
        onSave={(qid, value) => {
          updateJobAnswer(qid, value);
          setEditingId(null);
        }}
      />

      {/* Edit CLIENT answer */}
      <EditClientAnswerDialog
        question={
          editingClientId
            ? clientQuestions.find((q) => q.id === editingClientId) || null
            : null
        }
        currentValue={
          editingClientId ? clientAnswers[editingClientId] : undefined
        }
        clients={clients}
        selectedClientIdForPoc={selectedClientIdForPoc}
        onClose={() => setEditingClientId(null)}
        onSave={(qid, value) => {
          updateClientAnswer(qid, value);
          setEditingClientId(null);
        }}
      />
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  if (message.role === "assistant" && message.kind === "jd") {
    return (
      <div className="flex gap-3">
        <Avatar role="assistant" />
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-primary/30 bg-card/80 backdrop-blur p-4 shadow-glow">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Generated Job Description
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {message.text}
          </pre>
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex gap-3">
        <Avatar role="assistant" />
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-primary text-primary-foreground px-4 py-2.5 text-sm shadow-glow">
        {message.text}
      </div>
      <Avatar role="user" />
    </div>
  );
};

const Avatar = ({ role }: { role: "assistant" | "user" }) => (
  <div
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
      role === "assistant"
        ? "bg-gradient-primary shadow-glow"
        : "bg-muted border border-border"
    }`}
  >
    {role === "assistant" ? (
      <Bot className="h-4 w-4 text-primary-foreground" />
    ) : (
      <User className="h-4 w-4 text-muted-foreground" />
    )}
  </div>
);

/* ---------- Job answer input (unchanged behaviour) ---------- */

const JobAnswerInput = ({
  question,
  textInput,
  setTextInput,
  multiPick,
  setMultiPick,
  onSubmit,
  onSkip,
}: {
  question: ChatQuestion;
  textInput: string;
  setTextInput: (v: string) => void;
  multiPick: string[];
  setMultiPick: (v: string[]) => void;
  onSubmit: (value: string | string[]) => void;
  onSkip: () => void;
}) => {
  const showSuggested =
    question.suggestedEnabled &&
    question.options &&
    question.options.length > 0;

  if (question.inputType === "single_select") {
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSubmit(opt)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm hover:border-primary hover:bg-primary/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {question.required ? "Required" : "Optional — you can skip"}
          </span>
          {!question.required && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (question.inputType === "multi_select") {
    const toggle = (opt: string) =>
      setMultiPick(
        multiPick.includes(opt)
          ? multiPick.filter((o) => o !== opt)
          : [...multiPick, opt],
      );
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => {
            const active = multiPick.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <Checkbox
                  checked={active}
                  className="pointer-events-none h-3.5 w-3.5"
                />
                {opt}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {multiPick.length} selected
            {question.required ? " · Required" : " · Optional"}
          </span>
          <div className="flex items-center gap-2">
            {!question.required && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
            )}
            <Button
              size="sm"
              variant="hero"
              disabled={multiPick.length === 0}
              onClick={() => onSubmit(multiPick)}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // free_text
  return (
    <div>
      {showSuggested && (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSubmit(opt)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(textInput.trim());
        }}
        className="flex items-center gap-2"
      >
        <Input
          autoFocus
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your answer…"
          className="flex-1"
        />
        {!question.required && (
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button
          type="submit"
          variant="hero"
          size="sm"
          disabled={!textInput.trim()}
        >
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        {question.required ? "Required" : "Optional"}
      </p>
    </div>
  );
};

/* ---------- Client answer input ---------- */

const ClientAnswerInput = ({
  question,
  textInput,
  setTextInput,
  multiPick,
  setMultiPick,
  onSubmit,
  onSkip,
  clients,
  selectedClientIdForPoc,
}: {
  question: ClientQuestion;
  textInput: string;
  setTextInput: (v: string) => void;
  multiPick: string[];
  setMultiPick: (v: string[]) => void;
  onSubmit: (value: string | string[]) => void;
  onSkip: () => void;
  clients: Client[];
  selectedClientIdForPoc: string;
}) => {
  // CLIENT_PICKER
  if (question.inputType === "client_picker") {
    return (
      <ClientPickerInput
        clients={clients}
        onSubmit={(id) => onSubmit(id)}
        required={question.required}
        onSkip={onSkip}
      />
    );
  }

  // POC_PICKER
  if (question.inputType === "poc_picker") {
    return (
      <PocPickerInput
        clients={clients}
        selectedClientId={selectedClientIdForPoc}
        onSubmit={(id) => onSubmit(id)}
        required={question.required}
        onSkip={onSkip}
      />
    );
  }

  // SINGLE_SELECT
  if (question.inputType === "single_select") {
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSubmit(opt)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm hover:border-primary hover:bg-primary/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {question.required ? "Required" : "Optional — you can skip"}
          </span>
          {!question.required && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
      </div>
    );
  }

  // MULTI_SELECT
  if (question.inputType === "multi_select") {
    const toggle = (opt: string) =>
      setMultiPick(
        multiPick.includes(opt)
          ? multiPick.filter((o) => o !== opt)
          : [...multiPick, opt],
      );
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => {
            const active = multiPick.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <Checkbox
                  checked={active}
                  className="pointer-events-none h-3.5 w-3.5"
                />
                {opt}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {multiPick.length} selected
            {question.required ? " · Required" : " · Optional"}
          </span>
          <div className="flex items-center gap-2">
            {!question.required && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
            )}
            <Button
              size="sm"
              variant="hero"
              disabled={multiPick.length === 0}
              onClick={() => onSubmit(multiPick)}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // NUMBER / CURRENCY / FREE_TEXT
  const inputType =
    question.inputType === "number" || question.inputType === "currency"
      ? "number"
      : "text";
  const placeholder =
    question.inputType === "currency"
      ? "e.g. 75 (per hour) or 12000 (monthly)"
      : question.inputType === "number"
        ? "Enter a number…"
        : "Type your answer…";

  return (
    <div>
      {question.suggestedEnabled && question.options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSubmit(opt)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(textInput.trim());
        }}
        className="flex items-center gap-2"
      >
        {question.inputType === "currency" && (
          <span className="text-sm text-muted-foreground pl-1">$</span>
        )}
        <Input
          autoFocus
          type={inputType}
          inputMode={inputType === "number" ? "decimal" : "text"}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {!question.required && (
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button
          type="submit"
          variant="hero"
          size="sm"
          disabled={!textInput.trim()}
        >
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        {question.required ? "Required" : "Optional"}
      </p>
    </div>
  );
};

const ClientPickerInput = ({
  clients,
  onSubmit,
  required,
  onSkip,
}: {
  clients: Client[];
  onSubmit: (id: string) => void;
  required: boolean;
  onSkip: () => void;
}) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q),
    );
  }, [clients, search]);

  if (clients.length === 0) {
    return (
      <div className="rounded-xl bg-secondary/40 border border-dashed border-border p-4 text-sm text-muted-foreground">
        Your client directory is empty. Add clients in the admin first.
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="pl-9"
        />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-background/40">
        {filtered.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground text-center">
            No matches.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSubmit(c.id)}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[c.industry, c.location].filter(Boolean).join(" · ")} ·{" "}
                      {c.pocs.length} POC{c.pocs.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {required ? "Required" : "Optional — you can skip"}
        </span>
        {!required && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

const PocPickerInput = ({
  clients,
  selectedClientId,
  onSubmit,
  required,
  onSkip,
}: {
  clients: Client[];
  selectedClientId: string;
  onSubmit: (id: string) => void;
  required: boolean;
  onSkip: () => void;
}) => {
  const client = clients.find((c) => c.id === selectedClientId) || null;

  if (!client) {
    return (
      <div className="rounded-xl bg-secondary/40 border border-dashed border-border p-4 text-sm text-muted-foreground">
        Select a client first — POCs will be filtered to that client.
      </div>
    );
  }

  if (client.pocs.length === 0) {
    return (
      <div className="rounded-xl bg-secondary/40 border border-dashed border-border p-4 text-sm text-muted-foreground">
        No POCs on file for {client.name}. Skip and add one to the directory
        later.
        {!required && (
          <div className="mt-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 text-xs text-muted-foreground">
        POCs for{" "}
        <span className="text-foreground font-medium">{client.name}</span>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-background/40">
        <ul className="divide-y divide-border">
          {client.pocs.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSubmit(p.id)}
                className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-center gap-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[p.designation, p.email].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {required ? "Required" : "Optional — you can skip"}
        </span>
        {!required && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

/* ---------- Edit dialogs ---------- */

const EditJobAnswerDialog = ({
  question,
  currentValue,
  onClose,
  onSave,
}: {
  question: ChatQuestion | null;
  currentValue: string | string[] | undefined;
  onClose: () => void;
  onSave: (qid: string, value: string | string[]) => void;
}) => {
  const [text, setText] = useState("");
  const [multi, setMulti] = useState<string[]>([]);

  useEffect(() => {
    if (!question) return;
    if (question.inputType === "multi_select") {
      setMulti(Array.isArray(currentValue) ? currentValue : []);
      setText("");
    } else {
      setText(typeof currentValue === "string" ? currentValue : "");
      setMulti([]);
    }
  }, [question, currentValue]);

  if (!question) return null;

  const handleSave = () => {
    if (question.inputType === "multi_select") {
      onSave(question.id, multi);
    } else {
      onSave(question.id, text.trim());
    }
  };

  const toggleMulti = (opt: string) =>
    setMulti((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );

  return (
    <Dialog open={!!question} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit answer
          </DialogTitle>
          <DialogDescription>{question.text}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {question.inputType === "single_select" ? (
            <div className="flex flex-wrap gap-2">
              {question.options.map((opt) => {
                const active = text === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setText(opt)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-card hover:border-primary/60"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : question.inputType === "multi_select" ? (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {question.options.map((opt) => {
                  const active = multi.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMulti(opt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-card hover:border-primary/60"
                      }`}
                    >
                      <Checkbox
                        checked={active}
                        className="pointer-events-none h-3.5 w-3.5"
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {multi.length} selected
              </p>
            </>
          ) : (
            <Textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer…"
              className="min-h-[96px]"
            />
          )}

          {question.suggestedEnabled &&
            question.inputType === "free_text" &&
            question.options.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setText(opt)}
                      className="px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={
              question.inputType === "multi_select"
                ? multi.length === 0 && question.required
                : !text.trim() && question.required
            }
          >
            <Sparkle className="h-4 w-4" />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditClientAnswerDialog = ({
  question,
  currentValue,
  clients,
  selectedClientIdForPoc,
  onClose,
  onSave,
}: {
  question: ClientQuestion | null;
  currentValue: string | string[] | undefined;
  clients: Client[];
  selectedClientIdForPoc: string;
  onClose: () => void;
  onSave: (qid: string, value: string | string[]) => void;
}) => {
  const [text, setText] = useState("");
  const [multi, setMulti] = useState<string[]>([]);

  useEffect(() => {
    if (!question) return;
    if (question.inputType === "multi_select") {
      setMulti(Array.isArray(currentValue) ? currentValue : []);
      setText("");
    } else {
      setText(typeof currentValue === "string" ? currentValue : "");
      setMulti([]);
    }
  }, [question, currentValue]);

  if (!question) return null;

  const handleSave = () => {
    if (question.inputType === "multi_select") {
      onSave(question.id, multi);
    } else {
      onSave(question.id, text.trim());
    }
  };

  const toggleMulti = (opt: string) =>
    setMulti((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );

  const renderBody = () => {
    if (question.inputType === "client_picker") {
      return (
        <Select value={text} onValueChange={(v) => setText(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a client..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
                {c.industry ? ` · ${c.industry}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (question.inputType === "poc_picker") {
      const client = clients.find((c) => c.id === selectedClientIdForPoc);
      const pocs = client?.pocs ?? [];
      return (
        <Select
          value={text}
          onValueChange={(v) => setText(v)}
          disabled={!client}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                client
                  ? pocs.length === 0
                    ? "No POCs for this client"
                    : "Choose a POC..."
                  : "Select a client first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {pocs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
                {p.designation ? ` · ${p.designation}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (question.inputType === "single_select") {
      return (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => {
            const active = text === opt;
            return (
              <button
                key={opt}
                onClick={() => setText(opt)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }
    if (question.inputType === "multi_select") {
      return (
        <>
          <div className="flex flex-wrap gap-2 mb-2">
            {question.options.map((opt) => {
              const active = multi.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleMulti(opt)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-card hover:border-primary/60"
                  }`}
                >
                  <Checkbox
                    checked={active}
                    className="pointer-events-none h-3.5 w-3.5"
                  />
                  {opt}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {multi.length} selected
          </p>
        </>
      );
    }

    const inputType =
      question.inputType === "number" || question.inputType === "currency"
        ? "number"
        : "text";
    return (
      <div className="flex items-center gap-2">
        {question.inputType === "currency" && (
          <span className="text-sm text-muted-foreground">$</span>
        )}
        <Input
          autoFocus
          type={inputType}
          inputMode={inputType === "number" ? "decimal" : "text"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your answer…"
        />
      </div>
    );
  };

  return (
    <Dialog open={!!question} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit client answer
          </DialogTitle>
          <DialogDescription>{question.text}</DialogDescription>
        </DialogHeader>

        <div className="py-2">{renderBody()}</div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={
              question.inputType === "multi_select"
                ? multi.length === 0 && question.required
                : !text.trim() && question.required
            }
          >
            <Sparkle className="h-4 w-4" />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJob;
