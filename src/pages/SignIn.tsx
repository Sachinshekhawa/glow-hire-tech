import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    icon: Bot,
    title: "AI Job Intelligence",
    desc: "Auto-generate JDs, screening questions and candidate summaries.",
  },
  {
    icon: Users,
    title: "Smart Candidate Pipeline",
    desc: "Bulk-upload resumes and let AI shortlist the best matches.",
  },
  {
    icon: BarChart3,
    title: "Live Recruiter Dashboards",
    desc: "Track submissions, interviews and offers in real time.",
  },
  {
    icon: Zap,
    title: "Automated Interview Scheduling",
    desc: "Coordinate panels and reminders without the back-and-forth.",
  },
];

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeCap, setActiveCap] = useState(0);

  const from = (location.state as any)?.from || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  useEffect(() => {
    const id = window.setInterval(
      () => setActiveCap((i) => (i + 1) % capabilities.length),
      3500,
    );
    return () => window.clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing details",
        description: "Please enter both your email and password.",
        variant: "destructive",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast({ title: "Welcome back 👋", description: "Signed in successfully." });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({
        title: "Sign-in failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-15%] left-[-10%] h-[560px] w-[560px] rounded-full bg-primary/25 blur-[130px] animate-float" />
        <div
          className="absolute bottom-[-20%] right-[-10%] h-[560px] w-[560px] rounded-full bg-accent/25 blur-[130px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary-glow/15 blur-[100px] animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 px-6 py-5 flex items-center justify-between animate-fade-up">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Glo<span className="gradient-text">hire</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="container mx-auto min-h-screen grid lg:grid-cols-2 gap-10 items-center px-4 py-24">
        {/* LEFT — Product showcase */}
        <div className="hidden lg:flex flex-col justify-center animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded-full border border-border bg-card/60 text-xs font-medium text-muted-foreground w-fit">
            <Sparkles className="h-3 w-3 text-primary" />
            AI-native ATS for modern recruiters
          </div>

          <h2 className="font-display text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
            Hire <span className="gradient-text">smarter</span>,
            <br /> ship roles <span className="gradient-text">faster</span>.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Glohire unifies your jobs, candidates and interviews into one
            intelligent workspace — powered by AI that actually understands
            recruiting.
          </p>

          {/* Capability carousel */}
          <div className="mt-10 space-y-3 max-w-md">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              const active = i === activeCap;
              return (
                <button
                  key={cap.title}
                  type="button"
                  onClick={() => setActiveCap(i)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-all duration-500",
                    active
                      ? "border-primary/40 bg-card/80 shadow-glow scale-[1.02]"
                      : "border-border/60 bg-card/30 hover:bg-card/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-500",
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{cap.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {cap.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> SOC 2
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> GDPR ready
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 99.9% uptime
            </div>
          </div>
        </div>

        {/* RIGHT — Sign-in card */}
        <div
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div
            className="glow-border relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 md:p-10 shadow-elegant overflow-hidden"
            style={{ background: "var(--gradient-card)" }}
          >
            {/* top accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            {/* corner shimmer */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-glow-pulse"
            />

            <div className="mb-7 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-border bg-card/60 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Secure sign-in
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Welcome <span className="gradient-text">back</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your Glohire workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                className="space-y-2 animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                    className="pl-9 h-11 bg-background/60 border-border/70 focus-visible:border-primary/60 transition-all"
                  />
                </div>
              </div>

              <div
                className="space-y-2 animate-fade-up"
                style={{ animationDelay: "0.35s" }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors story-link"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    required
                    className="pl-9 pr-10 h-11 bg-background/60 border-border/70 focus-visible:border-primary/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div
                className="flex items-center gap-2 animate-fade-up"
                style={{ animationDelay: "0.45s" }}
              >
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground font-normal cursor-pointer"
                >
                  Keep me signed in for 30 days
                </Label>
              </div>

              <div
                className="animate-fade-up"
                style={{ animationDelay: "0.55s" }}
              >
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={loading}
                  className="w-full h-12 group"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p
              className="mt-6 text-center text-xs text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.65s" }}
            >
              Access by invitation only. Need an account?{" "}
              <a
                href="mailto:hello@glohire.ai"
                className="text-foreground font-medium hover:text-primary transition-colors story-link"
              >
                Contact your admin
              </a>
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Protected by enterprise-grade encryption · SOC 2 · GDPR
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
