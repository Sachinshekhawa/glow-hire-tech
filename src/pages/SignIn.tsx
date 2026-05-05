import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const from = (location.state as any)?.from || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  // Animated aurora canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const orbs = Array.from({ length: 6 }).map((_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.25 + Math.random() * 0.35,
      hue: i % 2 === 0 ? 187 : 265,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
    }));

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      orbs.forEach((o) => {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -0.2 || o.x > 1.2) o.vx *= -1;
        if (o.y < -0.2 || o.y > 1.2) o.vy *= -1;
        const cx = o.x * w;
        const cy = o.y * h;
        const radius = o.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `hsla(${o.hue}, 100%, 60%, 0.45)`);
        grad.addColorStop(1, `hsla(${o.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x: y, y: x });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Missing details", description: "Enter email and password.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast({ title: "Welcome back 👋" });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-4 py-10">
      {/* Aurora canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10 opacity-80" />
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40 -z-10" />
      {/* Vignette */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_85%)]" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group animate-fade-up">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Glo<span className="gradient-text">hire</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Sign-in card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.25s ease-out",
        }}
        className="relative w-full max-w-md animate-fade-up"
      >
        {/* Animated conic ring */}
        <div className="absolute -inset-[1.5px] rounded-3xl overflow-hidden">
          <div
            className="absolute inset-[-100%] opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary-glow)), hsl(var(--accent-glow)), hsl(var(--primary)))",
              animation: "spin 8s linear infinite",
            }}
          />
        </div>

        <div
          className="relative rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl p-8 md:p-10 shadow-elegant overflow-hidden"
          style={{ background: "var(--gradient-card)" }}
        >
          {/* Sparkle dots */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary/60"
                style={{
                  top: `${(i * 53) % 100}%`,
                  left: `${(i * 37) % 100}%`,
                  animation: `float ${4 + (i % 5)}s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.4 + ((i % 5) * 0.1),
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </div>

          <div className="relative mb-8 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary animate-fade-up">
              <ShieldCheck className="h-3 w-3" />
              Secure sign-in
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Welcome <span className="gradient-text animate-shimmer bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">back</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.15s" }}>
              Sign in to your Glohire workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.25s" }}>
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
                  className="pl-9 h-12 bg-background/50 border-border/70 focus-visible:border-primary/60 focus-visible:ring-primary/30 transition-all"
                />
                <span className="pointer-events-none absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
              </div>
            </div>

            <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.35s" }}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors story-link">
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
                  className="pl-9 pr-10 h-12 bg-background/50 border-border/70 focus-visible:border-primary/60 focus-visible:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <span className="pointer-events-none absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
              </div>
            </div>

            <div className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: "0.45s" }}>
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal cursor-pointer">
                Keep me signed in for 30 days
              </Label>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.55s" }}>
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full h-12 group relative overflow-hidden">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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

          <p className="relative mt-7 text-center text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.65s" }}>
            Access by invitation only. Need an account?{" "}
            <a href="mailto:hello@glohire.ai" className="text-foreground font-medium hover:text-primary transition-colors story-link">
              Contact your admin
            </a>
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground/80 tracking-wider uppercase">
          Enterprise-grade encryption · SOC 2 · GDPR
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SignIn;
