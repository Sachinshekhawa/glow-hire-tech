import { useMemo, useState } from "react";
import { Sparkles, Wand2, ArrowLeft, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChatQuestion } from "@/data/chatQuestions";
import { extractAnswersFromText } from "@/data/answerExtractor";
import { useToast } from "@/hooks/use-toast";

type Answers = Record<string, string | string[]>;

const SAMPLE =
  "Hiring a Senior Java Developer for Engineering, full-time in Bangalore. 2 openings, must know Spring Boot, Kubernetes and AWS. Salary 25-40 LPA.";

export const PromptMode = ({
  questions,
  onBack,
  onComplete,
}: {
  questions: ChatQuestion[];
  onBack: () => void;
  onComplete: (answers: Answers) => void;
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [extracted, setExtracted] = useState<Answers | null>(null);
  const [gapAnswers, setGapAnswers] = useState<Answers>({});

  const activeQs = useMemo(
    () => [...questions].sort((a, b) => a.order - b.order).filter((q) => q.active),
    [questions],
  );

  const handleExtract = () => {
    if (!prompt.trim()) {
      toast({
        title: "Add a prompt",
        description: "Describe the role you're hiring for.",
        variant: "destructive",
      });
      return;
    }
    const out = extractAnswersFromText(prompt, activeQs, null);
    setExtracted(out);
    setGapAnswers({});
  };

  const requiredGaps = useMemo(() => {
    if (!extracted) return [];
    return activeQs.filter(
      (q) =>
        q.required &&
        extracted[q.id] == null &&
        gapAnswers[q.id] == null,
    );
  }, [activeQs, extracted, gapAnswers]);

  const allExtractedView = useMemo(() => {
    if (!extracted) return [];
    return activeQs.filter((q) => extracted[q.id] != null);
  }, [activeQs, extracted]);

  const handleGenerate = () => {
    if (requiredGaps.length > 0) {
      toast({
        title: "Fill the missing required fields",
        description: `${requiredGaps.length} required answer${requiredGaps.length === 1 ? "" : "s"} still needed.`,
        variant: "destructive",
      });
      return;
    }
    onComplete({ ...(extracted || {}), ...gapAnswers });
  };

  const setGap = (qid: string, value: string | string[]) => {
    setGapAnswers((p) => ({ ...p, [qid]: value }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Change mode
      </button>

      <Card className="relative overflow-hidden p-6 border-border/60">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Describe the role</h2>
              <p className="text-xs text-muted-foreground">
                Write one prompt — Glohire AI will extract structured answers and draft your JD.
              </p>
            </div>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`e.g. ${SAMPLE}`}
            className="mt-5 min-h-[160px] resize-y text-sm"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPrompt(SAMPLE)}
              className="text-xs text-primary hover:underline"
            >
              Try a sample prompt
            </button>
            <div className="flex items-center gap-2">
              {extracted && (
                <Button variant="outline" size="sm" onClick={handleExtract}>
                  <Wand2 className="h-4 w-4" /> Re-extract
                </Button>
              )}
              {!extracted && (
                <Button variant="hero" size="sm" onClick={handleExtract}>
                  <Wand2 className="h-4 w-4" /> Extract answers
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {extracted && (
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <Check className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">
              Auto-extracted answers
            </h3>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {allExtractedView.length} of {activeQs.length} captured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Review — you can edit any answer from the Live Summary after the JD is generated.
          </p>

          {allExtractedView.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Couldn't auto-extract anything from that prompt. Try adding more details, or fill the gaps below.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {allExtractedView.map((q) => {
                const v = extracted[q.id];
                const display = Array.isArray(v) ? v.join(", ") : v;
                return (
                  <li
                    key={q.id}
                    className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                  >
                    <Wand2 className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{q.text}</p>
                      <p className="text-sm font-medium">{display}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {requiredGaps.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-5">
              <h4 className="text-sm font-semibold mb-1">Missing required details</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Quickly fill these before we generate the JD.
              </p>
              <div className="space-y-4">
                {requiredGaps.map((q) => (
                  <GapField
                    key={q.id}
                    question={q}
                    value={gapAnswers[q.id]}
                    onChange={(v) => setGap(q.id, v)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="hero" onClick={handleGenerate}>
              <Send className="h-4 w-4" /> Generate JD
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const GapField = ({
  question,
  value,
  onChange,
}: {
  question: ChatQuestion;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) => {
  if (question.inputType === "single_select") {
    return (
      <div>
        <label className="text-xs font-medium mb-1.5 block">
          {question.text}
        </label>
        <Select value={(value as string) || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (question.inputType === "multi_select") {
    const arr = (value as string[]) || [];
    return (
      <div>
        <label className="text-xs font-medium mb-1.5 block">
          {question.text}
        </label>
        <div className="flex flex-wrap gap-2">
          {question.options.map((o) => {
            const active = arr.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() =>
                  onChange(active ? arr.filter((x) => x !== o) : [...arr, o])
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <Checkbox checked={active} className="pointer-events-none h-3.5 w-3.5" />
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block">
        {question.text}
      </label>
      <Input
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer…"
      />
    </div>
  );
};
