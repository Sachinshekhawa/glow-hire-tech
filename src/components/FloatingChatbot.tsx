import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Draft an outreach email for a Senior React role",
  "Give me 5 screening questions for a DevOps engineer",
  "Summarise what to look for in a sales resume",
];

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm **Glohire AI**. Ask me about writing JDs, screening questions, outreach copy, interview prep — anything hiring related.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, streaming]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            /* ignore partial */
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${e.message || "Something went wrong."}`,
        };
        return copy;
      });
      toast.error(e.message || "Chat failed");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Glohire AI assistant"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-glow animate-glow-pulse">
          {open ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          )}
        </span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] animate-scale-in origin-bottom-right">
          <div className="glass-card rounded-2xl shadow-elegant overflow-hidden flex flex-col max-h-[70vh]">
            <div className="bg-gradient-primary p-4 flex items-center gap-3 shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <div className="flex-1">
                <div className="font-semibold text-primary-foreground text-sm">Glohire AI</div>
                <div className="text-xs text-primary-foreground/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  Online · Powered by Gemini
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary mt-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary rounded-tl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-pre:my-2">
                        {m.content ? (
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && !streaming && (
                <div className="flex flex-wrap gap-2 pl-9 pt-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-3 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={streaming ? "Thinking…" : "Ask anything about hiring..."}
                disabled={streaming}
                maxLength={2000}
                className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary shadow-glow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
