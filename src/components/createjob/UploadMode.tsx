import { useRef, useState } from "react";
import {
  Upload,
  ArrowLeft,
  FileText,
  X,
  Loader2,
  Send,
  ClipboardPaste,
  Wand2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatQuestion } from "@/data/chatQuestions";
import { extractAnswersFromText } from "@/data/answerExtractor";
import { extractTextFromFile, ACCEPT_ATTR } from "@/lib/jdFileParser";

type Answers = Record<string, string | string[]>;

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

export const UploadMode = ({
  questions,
  onBack,
  onComplete,
}: {
  questions: ChatQuestion[];
  onBack: () => void;
  /** Receives extracted answers + the JD body to render directly. */
  onComplete: (answers: Answers, jdText: string) => void;
}) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedText, setParsedText] = useState<string>("");
  const [pasted, setPasted] = useState("");

  const handleFile = async (f: File) => {
    setFile(f);
    setParsing(true);
    setParsedText("");
    try {
      const result = await extractTextFromFile(f);
      if (!result.text) {
        toast({
          title: "No text found",
          description: "We couldn't extract any text from that file. Try pasting instead.",
          variant: "destructive",
        });
      }
      setParsedText(result.text);
    } catch (err: any) {
      toast({
        title: "Couldn't parse file",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setParsedText("");
  };

  const useThisJD = () => {
    const jdText = (tab === "upload" ? parsedText : pasted).trim();
    if (!jdText) {
      toast({
        title: "Nothing to use",
        description: tab === "upload" ? "Upload a file first." : "Paste the JD content first.",
        variant: "destructive",
      });
      return;
    }
    const activeQs = [...questions]
      .sort((a, b) => a.order - b.order)
      .filter((q) => q.active);
    const extracted = extractAnswersFromText(jdText, activeQs, null);
    onComplete(extracted, jdText);
  };

  const previewText = tab === "upload" ? parsedText : pasted;

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
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Upload className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Upload or paste a JD
              </h2>
              <p className="text-xs text-muted-foreground">
                We'll extract the text and pre-fill the structured answers.
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "paste")}>
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload file
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5" /> Paste text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/20 p-10 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Drop your JD here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse — PDF, DOCX, TXT supported
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Audio &amp; legacy .doc not supported in browser yet — please paste text instead.
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    onChange={onPick}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    {parsing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Check className="h-3 w-3 text-primary" />
                        Parsed
                      </Badge>
                    )}
                    <button
                      onClick={reset}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {parsedText && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Extracted preview
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {parsedText.length.toLocaleString()} chars
                        </span>
                      </div>
                      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/80">
                        {parsedText.slice(0, 2000)}
                        {parsedText.length > 2000 && "\n\n…"}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste" className="mt-4">
              <Textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="Paste the full job description here…"
                className="min-h-[220px] resize-y text-sm"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {pasted.length.toLocaleString()} characters
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              We'll auto-extract title, skills, location and more from the text.
            </div>
            <Button
              variant="hero"
              onClick={useThisJD}
              disabled={parsing || !previewText.trim()}
            >
              <Send className="h-4 w-4" /> Use this JD
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
