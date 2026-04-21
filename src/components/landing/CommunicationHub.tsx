import { Mail, MessageCircle, Linkedin, Phone, Bot, Bell, Inbox } from "lucide-react";
import inboxImg from "@/assets/inbox-mockup.jpg";

const channels = [
  { icon: Mail, label: "Email", color: "from-cyan-400 to-blue-500" },
  { icon: MessageCircle, label: "WhatsApp", color: "from-green-400 to-emerald-500" },
  { icon: Phone, label: "SMS", color: "from-violet-400 to-purple-500" },
  { icon: Linkedin, label: "LinkedIn", color: "from-blue-400 to-indigo-500" },
  { icon: Bot, label: "AI Chatbot", color: "from-pink-400 to-fuchsia-500" },
  { icon: Bell, label: "Auto Follow-ups", color: "from-amber-400 to-orange-500" },
];

const CommunicationHub = () => {
  return (
    <section id="comms" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Inbox className="h-3.5 w-3.5" />
            Multi-Channel Communication Hub
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Engage candidates <span className="gradient-text">wherever they are</span> — from one unified dashboard.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Stop juggling 5 inboxes and 3 outreach tools. Glohire turns every channel
            into one continuous conversation per candidate.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Channels grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="glass-card rounded-xl p-5 hover:border-primary/40 transition-all hover:-translate-y-0.5 group"
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} shadow-glow group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="mt-3 text-sm font-medium">{c.label}</div>
                </div>
              );
            })}
          </div>

          {/* Inbox visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-primary opacity-25 blur-3xl rounded-3xl" />
            <div className="relative glass-card rounded-2xl p-2 shadow-violet">
              <img
                src={inboxImg}
                alt="Glohire unified inbox showing all channels"
                width={1600}
                height={1024}
                loading="lazy"
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="mt-20 glass-card rounded-2xl p-6 md:p-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Candidate Journey · Automated end-to-end
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-2">
            {[
              { icon: Mail, label: "Email outreach" },
              { icon: MessageCircle, label: "WhatsApp reply" },
              { icon: Bot, label: "AI chat qualifies" },
              { icon: Phone, label: "SMS reminder" },
              { icon: Inbox, label: "Interview booked" },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="hidden md:inline text-primary">→</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Teams using Glohire's unified inbox see <span className="text-foreground font-semibold">3× higher candidate response rates</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunicationHub;
