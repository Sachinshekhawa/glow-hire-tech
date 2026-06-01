import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AGENTS } from "@/data/agents";

const AgentsHub = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              AI Agents
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Your <span className="gradient-text">Glohire</span> AI workforce
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Specialised agents that help your team source, screen, evaluate and close faster.
              Pick an agent to start chatting — each one is tuned for a specific recruiting workflow.
            </p>
          </div>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-elegant transition-all overflow-hidden"
              >
                <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${agent.accent} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`} />
                <div className="relative">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${agent.accent} shadow-glow mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{agent.tagline}</p>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{agent.description}</p>

                  <ul className="mt-4 space-y-1.5">
                    {agent.capabilities.slice(0, 3).map((c) => (
                      <li key={c} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                    Chat with agent <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentsHub;
