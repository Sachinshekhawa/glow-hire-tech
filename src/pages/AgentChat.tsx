import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { AGENTS, getAgent } from "@/data/agents";

type Msg = { role: "user" | "assistant"; content: string };

const storageKey = (id: string) => `glohire.agent.${id}.messages`;

const AgentChat = () => {
  const { agentId = "" } = useParams();
  const navigate = useNavigate();
  const agent = useMemo(() => getAgent(agentId), [agentId]);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted messages on agent change
  useEffect(() => {
    if (!agent) return;
    try {
      const raw = localStorage.getItem(storageKey(agent.id));
      const parsed: Msg[] = raw ? JSON.parse(raw) : [];
      setMessages(
        parsed.length > 0
          ? parsed
          : [{ role: "assistant", content: agent.greeting }],
      );
    } catch {
      setMessages([{ role: "assistant", content: agent.greeting }]);
    }
    inputRef.current?.focus();
  }, [agent?.id]);

  // Persist
  useEffect(() => {
    if (!agent || messages.length === 0) return;
    try {
      localStorage.setItem(storageKey(agent.id), JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages, agent?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Agent not found.</p>
          <Link to="/agents" className="text-primary text-sm mt-2 inline-block">Back to agents</Link>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = agent.icon;

  const reset = () => {
    localStorage.removeItem(storageKey(agent.id));
    setMessages([{ role: "assistant", content: agent.greeting }]);
    inputRef.current?.focus();
  };

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
        body: JSON.stringify({ messages: next, systemPrompt: agent.systemPrompt }),
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
            /* ignore */
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
      inputRef.current?.focus();
    }
  };

  const hasOnlyGreeting = messages.length <= 1;

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-9rem)]">
        {/* Agent switcher */}
        <aside className="hidden lg:flex flex-col gap-2 overflow-y-auto">
          <Link
            to="/agents"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All agents
          </Link>
          {AGENTS.map((a) => {
            const AIcon = a.icon;
            const active = a.id === agent.id;
            return (
              <button
                key={a.id}
                onClick={() => navigate(`/agents/${a.id}`)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? "bg-primary/5 border-primary/40"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${a.accent}`}>
                    <AIcon className="h-4 w-4 text-white" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.tagline}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Chat panel */}
        <section className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden min-h-0">
          <header className={`p-4 border-b border-border flex items-center gap-3 bg-gradient-to-r ${agent.accent} bg-opacity-10`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${agent.accent} shadow-glow`}>
              <Icon className="h-5 w-5 text-white" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-2">
                {agent.name}
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">AI</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{agent.tagline}</div>
            </div>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${agent.accent} mt-0.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/60 rounded-tl-sm"
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

            {hasOnlyGreeting && !streaming && (
              <div className="pt-2 pl-10 flex flex-wrap gap-2">
                {agent.suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-left"
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
            className="border-t border-border p-3 flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={streaming ? "Thinking…" : `Message ${agent.name}…`}
              disabled={streaming}
              maxLength={4000}
              className="flex-1 bg-muted/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 resize-none max-h-40"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${agent.accent} shadow-glow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100`}
              aria-label="Send"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AgentChat;
