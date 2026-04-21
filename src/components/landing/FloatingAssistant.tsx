import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";

const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-40 group"
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

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 animate-scale-in origin-bottom-right">
          <div className="glass-card rounded-2xl shadow-elegant overflow-hidden">
            <div className="bg-gradient-primary p-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <div>
                <div className="font-semibold text-primary-foreground text-sm">Glohire AI</div>
                <div className="text-xs text-primary-foreground/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · Replies instantly
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
              <div className="flex gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">
                  Hi, I'm Glohire AI 👋 Want me to show how we can automate your hiring?
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {[
                  "How does AI sourcing work?",
                  "Show me the unified inbox",
                  "Book a demo",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setOpen(false)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="border-t border-border p-3 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask anything about hiring..."
                maxLength={200}
                className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary shadow-glow hover:scale-105 transition-transform"
                aria-label="Send"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAssistant;
