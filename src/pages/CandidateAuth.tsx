import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, User, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureCandidateRole } from "@/data/candidatePortal";

const perks = [
  "Track every application in real time",
  "Get matched to roles that fit your skills",
  "Keep one resume, always up to date",
];

const CandidateAuth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/portal", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          await ensureCandidateRole().catch(() => null);
          toast({ title: "Welcome to Glohire", description: "Your candidate profile is ready." });
          navigate("/portal", { replace: true });
        } else {
          toast({
            title: "Check your inbox",
            description: "Confirm your email address, then sign in to open your portal.",
          });
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await ensureCandidateRole().catch(() => null);
        navigate("/portal", { replace: true });
      }
    } catch (err) {
      toast({
        title: mode === "signup" ? "Sign-up failed" : "Sign-in failed",
        description: (err as Error)?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-3xl animate-float [animation-delay:1.5s]" />
      </div>

      <header className="absolute top-0 inset-x-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Glo<span className="gradient-text">hire</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signin">Recruiter login</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 min-h-screen container flex flex-col lg:flex-row items-center justify-center gap-12 py-28">
        <div className="hidden lg:flex flex-1 flex-col gap-6 max-w-lg animate-fade-up">
          <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
            <User className="h-3 w-3" />
            Candidate portal
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
            Your career, <span className="gradient-text">in one place</span>.
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your latest resume once, tell us when you're open to work, and let Glohire
            surface the roles that actually fit.
          </p>
          <ul className="space-y-3">
            {perks.map((p, i) => (
              <li
                key={p}
                className="flex items-center gap-3 text-sm text-muted-foreground animate-fade-up"
                style={{ animationDelay: `${120 * (i + 1)}ms` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <div
            className="rounded-3xl border border-border/60 backdrop-blur-2xl p-8 md:p-10 shadow-elegant"
            style={{ background: "var(--gradient-card)" }}
          >
            <div className="mb-6 flex rounded-xl border border-border/60 bg-muted/40 p-1">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Log in" : "Create account"}
                </button>
              ))}
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight">
              {mode === "signin" ? (
                <>Welcome <span className="gradient-text">back</span></>
              ) : (
                <>Join <span className="gradient-text">Glohire</span></>
              )}
            </h2>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Log in to manage your profile and applications."
                : "Create a free candidate account in seconds."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="space-y-2 animate-fade-up">
                  <Label htmlFor="fullName">Full name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      maxLength={120}
                      required
                      className="pl-9 h-12 bg-background/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    required
                    className="pl-9 h-12 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder={mode === "signin" ? "Enter your password" : "At least 8 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={mode === "signup" ? 8 : undefined}
                    maxLength={128}
                    required
                    className="pl-9 pr-10 h-12 bg-background/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full h-12 group">
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                ) : mode === "signin" ? (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Create account
                    <UserPlus className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateAuth;
