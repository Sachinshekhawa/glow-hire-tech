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

type ChatMessage =
  | { id: string; role: "assistant"; kind: "question"; questionId: string; text: string }
  | { id: string; role: "assistant"; kind: "info"; text: string }
  | { id: string; role: "assistant"; kind: "jd"; text: string }
  | { id: string; role: "user"; text: string; questionId: string };

type Answers = Record<string, string | string[]>;

const conditionPasses = (cond: Condition, answers: Answers): boolean => {
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

/**
 * A question is shown if:
 *  - active = true, AND
 *  - has no conditions OR at least one condition passes against current answers
 */
const isQuestionEligible = (q: ChatQuestion, answers: Answers): boolean => {
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

  // Append any additional answered questions not covered above
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

const CreateJob = () => {
  const { toast } = useToast();
  const [questions] = useState<ChatQuestion[]>(() => loadQuestions());
  const [clients] = useState<Client[]>(() => loadClients());
  const [answers, setAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [multiPick, setMultiPick] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedPocId, setSelectedPocId] = useState<string>("");
  const [clientSubmitted, setClientSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoFilledIds, setAutoFilledIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId],
  );
  const selectedPoc = useMemo(
    () => selectedClient?.pocs.find((p) => p.id === selectedPocId) || null,
    [selectedClient, selectedPocId],
  );

  // Eligible question pipeline based on current answers
  const eligibleQueue = useMemo(
    () =>
      [...questions]
        .sort((a, b) => a.order - b.order)
        .filter((q) => isQuestionEligible(q, answers)),
    [questions, answers],
  );

  const askedIds = useMemo(
    () =>
      new Set(
        messages
          .filter((m) => m.role === "assistant" && (m as any).kind === "question")
          .map((m) => (m as any).questionId as string),
      ),
    [messages],
  );

  const currentQuestion = useMemo(() => {
    return eligibleQueue.find((q) => answers[q.id] == null) || null;
  }, [eligibleQueue, answers]);

  // Initial greeting + first question
  useEffect(() => {
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
  }, []);

  // Push the next question into the chat whenever it changes
  useEffect(() => {
    if (!currentQuestion) {
      if (!completed && Object.keys(answers).length > 0) {
        const jd = buildJD(questions, answers);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            kind: "info",
            text: "Perfect — I have everything I need. Here's your draft job description ✨",
          },
          { id: uid(), role: "assistant", kind: "jd", text: jd },
        ]);
        setCompleted(true);
      }
      return;
    }
    if (askedIds.has(currentQuestion.id)) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "assistant",
        kind: "question",
        questionId: currentQuestion.id,
        text: currentQuestion.text,
      },
    ]);
    setMultiPick([]);
    setTextInput("");
  }, [currentQuestion, askedIds, completed, answers, questions]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, currentQuestion]);

  const submitAnswer = (value: string | string[]) => {
    if (!currentQuestion) return;
    const display = Array.isArray(value) ? value.join(", ") : value;
    if (!display.trim()) {
      if (currentQuestion.required) {
        toast({
          title: "Answer required",
          description: "This question is required to continue.",
          variant: "destructive",
        });
        return;
      }
    }

    // Detect bonus answers in the same utterance — only meaningful when
    // the user typed free text (not when they tapped a suggestion pill).
    const isFreeText =
      currentQuestion.inputType === "free_text" && typeof value === "string";
    const extras = isFreeText
      ? extractAnswersFromText(value as string, questions, currentQuestion.id)
      : {};
    // Don't overwrite anything the user has already answered explicitly
    const newExtras: Record<string, string | string[]> = {};
    Object.entries(extras).forEach(([qid, v]) => {
      if (answers[qid] == null) newExtras[qid] = v;
    });

    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        text: display || "(skipped)",
        questionId: currentQuestion.id,
      },
    ]);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
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

  const skip = () => {
    if (!currentQuestion || currentQuestion.required) return;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "user",
        text: "(skipped)",
        questionId: currentQuestion.id,
      },
    ]);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: "" }));
  };

  const updateAnswer = (qid: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setAutoFilledIds((prev) => {
      const next = new Set(prev);
      next.delete(qid);
      return next;
    });
    // If JD is already on screen, regenerate it
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

  const restart = () => {
    setAnswers({});
    setMessages([]);
    setCompleted(false);
    setTextInput("");
    setMultiPick([]);
    setAutoFilledIds(new Set());
    setEditingId(null);
    setSelectedClientId("");
    setSelectedPocId("");
    setClientSubmitted(false);
  };

  const totalActive = eligibleQueue.length || 1;
  const answeredCount = eligibleQueue.filter(
    (q) => answers[q.id] != null,
  ).length;
  const progress = Math.min(100, Math.round((answeredCount / totalActive) * 100));

  const lastJd = [...messages].reverse().find((m) => (m as any).kind === "jd");

  const copyJD = async () => {
    if (!lastJd) return;
    await navigator.clipboard.writeText((lastJd as any).text);
    toast({ title: "Copied", description: "Job description copied to clipboard." });
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
    if (!clientSubmitted || !selectedClient || !selectedPoc) return;
    const lines: string[] = [];
    lines.push(`# Internal: Client & POC — ${(answers["q-1"] as string) || "Job"}`);
    lines.push("");
    lines.push("> Internal recruiter use only. Do NOT share with candidates.");
    lines.push("");
    lines.push("## Client");
    lines.push(`- **Name:** ${selectedClient.name}`);
    if (selectedClient.industry) lines.push(`- **Industry:** ${selectedClient.industry}`);
    if (selectedClient.location) lines.push(`- **Location:** ${selectedClient.location}`);
    if (selectedClient.website) lines.push(`- **Website:** ${selectedClient.website}`);
    lines.push("");
    lines.push("## Point of Contact");
    lines.push(`- **Name:** ${selectedPoc.name}`);
    if (selectedPoc.designation) lines.push(`- **Designation:** ${selectedPoc.designation}`);
    lines.push(`- **Email:** ${selectedPoc.email}`);
    if (selectedPoc.phone) lines.push(`- **Phone:** ${selectedPoc.phone}`);
    if (selectedPoc.notes) lines.push(`- **Notes:** ${selectedPoc.notes}`);
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug}-client-poc.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitClientForm = () => {
    if (!selectedClient) {
      toast({ title: "Select a client", variant: "destructive" });
      return;
    }
    if (!selectedPoc) {
      toast({ title: "Select a point of contact", variant: "destructive" });
      return;
    }
    setClientSubmitted(true);
    toast({
      title: "Client & POC linked",
      description: `${selectedClient.name} · ${selectedPoc.name}`,
    });
  };

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
                  Chat with Glohire AI to generate a JD
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Chat column */}
          <Card className="relative overflow-hidden border-border/60">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative flex flex-col h-[70vh] min-h-[520px]">
              {/* Progress */}
              <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Glohire Assistant</span>
                    <Badge variant="secondary" className="text-[10px]">
                      AI
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
                      {clientSubmitted
                        ? "Job, client & POC saved"
                        : "JD ready — add client & POC below"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyJD}>
                        <Copy className="h-4 w-4" /> Copy JD
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadJD}>
                        <Download className="h-4 w-4" /> Download JD
                      </Button>
                      <Button variant="hero" size="sm" onClick={restart}>
                        <RefreshCw className="h-4 w-4" /> New Job
                      </Button>
                    </div>
                  </div>
                ) : currentQuestion ? (
                  <AnswerInput
                    key={currentQuestion.id}
                    question={currentQuestion}
                    textInput={textInput}
                    setTextInput={setTextInput}
                    multiPick={multiPick}
                    setMultiPick={setMultiPick}
                    onSubmit={submitAnswer}
                    onSkip={skip}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active questions configured.{" "}
                    <Link
                      to="/admin/system-behavior"
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
                <h2 className="text-sm font-semibold">Live Summary</h2>
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

        {/* Post-JD: Client & POC capture */}
        {completed && (
          <ClientPocSection
            clients={clients}
            selectedClientId={selectedClientId}
            selectedPocId={selectedPocId}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setSelectedPocId("");
            }}
            onSelectPoc={setSelectedPocId}
            onSubmit={submitClientForm}
            submitted={clientSubmitted}
            onEdit={() => setClientSubmitted(false)}
            onDownloadInternal={downloadInternal}
          />
        )}
      </main>

      <EditAnswerDialog
        question={
          editingId ? questions.find((q) => q.id === editingId) || null : null
        }
        currentValue={editingId ? answers[editingId] : undefined}
        onClose={() => setEditingId(null)}
        onSave={(qid, value) => {
          updateAnswer(qid, value);
          setEditingId(null);
        }}
      />
    </div>
  );
};

const ClientPocSection = ({
  clients,
  selectedClientId,
  selectedPocId,
  onSelectClient,
  onSelectPoc,
  onSubmit,
  submitted,
  onEdit,
  onDownloadInternal,
}: {
  clients: Client[];
  selectedClientId: string;
  selectedPocId: string;
  onSelectClient: (id: string) => void;
  onSelectPoc: (id: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  onEdit: () => void;
  onDownloadInternal: () => void;
}) => {
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const selectedPoc =
    selectedClient?.pocs.find((p) => p.id === selectedPocId) || null;

  if (clients.length === 0) {
    return (
      <Card className="mt-6 p-6 border-dashed border-border/60">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold">
              No clients in your directory
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add clients and their POCs in{" "}
              <Link
                to="/admin/client-fields"
                className="text-primary underline-offset-4 hover:underline"
              >
                System Behavior → Clients &amp; POCs
              </Link>
              , then come back to assign one to this job.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 relative overflow-hidden border-border/60">
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Assign Client &amp; Point of Contact
              </h2>
              <p className="text-xs text-muted-foreground">
                Select an existing client and POC from your directory.{" "}
                <span className="text-foreground font-medium">
                  Never appears in the JD.
                </span>
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Internal
          </Badge>
        </div>

        {submitted && selectedClient && selectedPoc ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SelectedClientCard client={selectedClient} />
            <SelectedPocCard poc={selectedPoc} />
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                Linked to this job
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Change selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadInternal}
                >
                  <Download className="h-4 w-4" /> Download internal sheet
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {/* Client picker */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold">Client</h3>
                </div>
                <Label htmlFor="client-pick" className="text-xs">
                  Select client
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Select value={selectedClientId} onValueChange={onSelectClient}>
                  <SelectTrigger id="client-pick" className="mt-1.5">
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
                {selectedClient && (
                  <div className="mt-3 rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
                    {selectedClient.location && (
                      <div>📍 {selectedClient.location}</div>
                    )}
                    {selectedClient.website && (
                      <div className="truncate">🌐 {selectedClient.website}</div>
                    )}
                    <div>
                      👥 {selectedClient.pocs.length} POC
                      {selectedClient.pocs.length === 1 ? "" : "s"} on file
                    </div>
                  </div>
                )}
              </div>

              {/* POC picker */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold">Point of Contact</h3>
                </div>
                <Label htmlFor="poc-pick" className="text-xs">
                  Select POC
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Select
                  value={selectedPocId}
                  onValueChange={onSelectPoc}
                  disabled={!selectedClient}
                >
                  <SelectTrigger id="poc-pick" className="mt-1.5">
                    <SelectValue
                      placeholder={
                        selectedClient
                          ? selectedClient.pocs.length === 0
                            ? "No POCs for this client"
                            : "Choose a POC..."
                          : "Select a client first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClient?.pocs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.designation ? ` · ${p.designation}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPoc && (
                  <div className="mt-3 rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
                    <div className="truncate">✉️ {selectedPoc.email}</div>
                    {selectedPoc.phone && <div>📞 {selectedPoc.phone}</div>}
                    {selectedPoc.notes && (
                      <div className="italic line-clamp-2">
                        “{selectedPoc.notes}”
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Don't see them? Add new clients or POCs in{" "}
                <Link
                  to="/admin/client-fields"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  System Behavior → Clients &amp; POCs
                </Link>
                .
              </p>
              <Button
                variant="hero"
                size="sm"
                onClick={onSubmit}
                disabled={!selectedClient || !selectedPoc}
              >
                <Check className="h-4 w-4" /> Link to job
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

const SelectedClientCard = ({ client }: { client: Client }) => (
  <div className="rounded-xl border border-border/60 bg-background/40 p-4">
    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Building2 className="h-3.5 w-3.5" />
      Client
    </div>
    <p className="text-base font-display font-semibold">{client.name}</p>
    {client.industry && (
      <Badge variant="secondary" className="mt-1 text-[10px]">
        {client.industry}
      </Badge>
    )}
    <dl className="mt-3 space-y-1.5 text-xs">
      {client.location && (
        <div className="text-muted-foreground">📍 {client.location}</div>
      )}
      {client.website && (
        <div className="truncate text-muted-foreground">🌐 {client.website}</div>
      )}
    </dl>
  </div>
);

const SelectedPocCard = ({ poc }: { poc: POC }) => (
  <div className="rounded-xl border border-border/60 bg-background/40 p-4">
    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <UserRound className="h-3.5 w-3.5" />
      Point of Contact
    </div>
    <p className="text-base font-display font-semibold">{poc.name}</p>
    {poc.designation && (
      <p className="text-xs text-muted-foreground">{poc.designation}</p>
    )}
    <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
      <div className="truncate">✉️ {poc.email}</div>
      {poc.phone && <div>📞 {poc.phone}</div>}
      {poc.notes && <div className="italic line-clamp-2">“{poc.notes}”</div>}
    </dl>
  </div>
);

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
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm">
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

const AnswerInput = ({
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
    question.suggestedEnabled && question.options && question.options.length > 0;

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
        <Button type="submit" variant="hero" size="sm" disabled={!textInput.trim()}>
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        {question.required ? "Required" : "Optional"}
      </p>
    </div>
  );
};

export default CreateJob;
