import { ArrowRight, Search, FileSearch, Video, MessagesSquare, BarChart3, Code2, ScanFace, Globe, Bot, Briefcase, Users, FileText, Store, PhoneCall, Sparkles, CheckCircle2 } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import CtaForm from "@/components/landing/CtaForm";
import FloatingAssistant from "@/components/landing/FloatingAssistant";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const coreServices = [
  { icon: Search, title: "AI Sourcing", desc: "Discover candidates across 30+ platforms with ML-based job-to-candidate matching." },
  { icon: FileSearch, title: "Resume Screening", desc: "Resume parsing, ranking and skill extraction in seconds — at scale." },
  { icon: Code2, title: "Assessments", desc: "Auto-evaluated coding tests, skill assessments and custom screening flows." },
  { icon: Video, title: "AI Interviews", desc: "AI voice & video interviews with sentiment, behavioral and proctoring insights." },
  { icon: MessagesSquare, title: "Engagement Hub", desc: "Multi-channel outreach, drip campaigns and smart follow-ups on autopilot." },
  { icon: BarChart3, title: "Analytics & Forecasts", desc: "Pipeline health, recruiter performance and hiring forecasts — real-time." },
  { icon: ScanFace, title: "Fraud Detection", desc: "Identity checks, plagiarism scans and behavioral anomaly detection." },
  { icon: Globe, title: "Global Hiring", desc: "Multi-language AI, time-zone aware scheduling and remote-first workflows." },
];

const agentServices = [
  { icon: Briefcase, title: "Recruiter Agent", desc: "Job summaries, AI-crafted JDs, automated multi-board posting and outreach copy.", points: ["AI Job Description", "Multi-board posting", "Mail templates"] },
  { icon: Users, title: "Candidate Agent", desc: "Relevancy scoring, pipeline & submission insights and personalised Q&A.", points: ["Relevancy check", "Pipeline status", "Personalised Q&A"] },
  { icon: FileText, title: "Resume Intelligence", desc: "Diff latest vs past resumes, career trajectory analysis and red-flag detection.", points: ["Version compare", "Career trajectory", "Recommendation"] },
  { icon: Store, title: "Marketplace Agent", desc: "Real-time bill-rate benchmarks by experience, location and title.", points: ["Rate intelligence", "Geo benchmarks", "Title comparisons"] },
  { icon: PhoneCall, title: "Zoom Calling Agent", desc: "AI call summaries, key discussion points, sentiment and behavioural analysis.", points: ["Call summaries", "Sentiment analysis", "Behaviour signals"] },
];

const deliveryServices = [
  { title: "Managed RPO", desc: "End-to-end recruitment process outsourcing run by Glohire pods, powered by our AI stack." },
  { title: "Contract Staffing", desc: "On-demand contract talent with compliance, onboarding and timesheet automation." },
  { title: "Executive Search", desc: "AI-augmented leadership hiring with deep market mapping and confidential outreach." },
  { title: "Vendor Management", desc: "Unified VMS for client requisitions, scorecards and AI vs human interview routing." },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
          </div>
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Services
              </div>
              <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                Everything you need to{" "}
                <span className="gradient-text">hire autonomously.</span>
              </h1>
              <p className="mt-5 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                From AI sourcing and interviews to specialist agents and managed delivery —
                Glohire is the single platform behind modern talent teams.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" asChild>
                  <a href="#cta">Book a Demo <ArrowRight className="h-5 w-5" /></a>
                </Button>
                <Button variant="outline-glow" size="xl" asChild>
                  <a href="#core">Explore Services</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Core platform services */}
        <section id="core" className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Platform</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                Core <span className="gradient-text">recruiting services</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Eight integrated engines that replace your sourcing tool, screener, assessment platform, interviewer, CRM and analytics suite.
              </p>
            </div>

            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreServices.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="group relative rounded-2xl border border-border bg-card/40 p-6 hover:bg-card/80 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                    <Icon className="h-7 w-7 text-primary" />
                    <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Agents */}
        <section className="py-20 md:py-28 border-t border-border">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Specialist Agents</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                Five AI agents, <span className="gradient-text">one workspace.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Purpose-built copilots for every stage of the hiring lifecycle — chat with them from anywhere in Glohire.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agentServices.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </span>
                      <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {a.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Button variant="outline-glow" asChild>
                <a href="/agents"><Bot className="h-4 w-4" /> Open Agents Hub</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Managed delivery */}
        <section className="py-20 md:py-28 border-t border-border">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Managed Delivery</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                Done-for-you <span className="gradient-text">hiring services.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Combine the platform with Glohire pods for fully managed talent delivery at any scale.
              </p>
            </div>

            <div className="mt-14 grid sm:grid-cols-2 gap-4">
              {deliveryServices.map((d) => (
                <div key={d.title} className="rounded-2xl border border-border bg-card/40 p-6 hover:bg-card/80 transition-colors">
                  <h3 className="font-display text-xl font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CtaForm />
      </main>

      <Footer />
      <FloatingAssistant />
    </div>
  );
};

export default Services;
