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

  const from = (location.state as any)?.from || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  // Full-screen particle network animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    const count = Math.min(110, Math.floor((w * h) / 14000));
    const particles: P[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      hue: Math.random() < 0.5 ? 187 : 265,
    }));

    // Background aurora orbs
    const orbs = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.35 + Math.random() * 0.3,
      hue: i % 2 === 0 ? 187 : 265,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));

    let t = 0;
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const render = () => {
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Aurora background
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
        grad.addColorStop(0, `hsla(${o.hue}, 100%, 60%, 0.25)`);
        grad.addColorStop(1, `hsla(${o.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particle network
      ctx.globalCompositeOperation = "source-over";
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Mouse repulsion
        const dxm = p.x - mx;
        const dym = p.y - my;
        const distM = Math.hypot(dxm, dym);
        if (distM < 140) {
          const force = (140 - distM) / 140;
          p.vx += (dxm / distM) * force * 0.4;
          p.vy += (dym / distM) * force * 0.4;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        // Gentle drift
        p.vx += Math.sin(t + p.y * 0.01) * 0.005;
        p.vy += Math.cos(t + p.x * 0.01) * 0.005;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, 0.85)`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.35;
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 100%, 70%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

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
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Full-screen animated canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-screen h-screen -z-10" />
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 -z-10 pointer-events-none" />
      {/* Subtle vignette */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background)/0.7)_100%)]" />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group animate-fade-up">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Glo<span className="gradient-text">hire</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Left tagline (desktop) */}
      <div className="hidden lg:flex absolute left-12 top-1/2 -translate-y-1/2 z-10 max-w-md flex-col gap-6 animate-fade-up">
        <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          AI-powered hiring
        </div>
        <h2 className="font-display text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
          Hire <span className="gradient-text">smarter</span>,<br />
          not harder.
        </h2>
        <p className="text-muted-foreground text-lg max-w-sm">
          Glohire turns your pipeline into a living, intelligent recruiting engine.
        </p>
      </div>

      {/* Right-aligned sign-in card */}
      <main className="relative z-10 min-h-screen flex items-center justify-center lg:justify-end px-4 md:px-10 lg:pr-16 py-24">
        <div className="relative w-full max-w-md animate-fade-up">
          {/* Conic ring */}
          <div className="absolute -inset-[1.5px] rounded-3xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-[-100%] opacity-60"
              style={{
                background:
                  "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary-glow)), hsl(var(--accent-glow)), hsl(var(--primary)))",
                animation: "spin 10s linear infinite",
              }}
            />
          </div>

          <div
            className="relative rounded-3xl border border-border/60 backdrop-blur-2xl p-8 md:p-10 shadow-elegant overflow-hidden"
            style={{ background: "var(--gradient-card)" }}
          >
            <div className="relative mb-7 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
                <ShieldCheck className="h-3 w-3" />
                Secure sign-in
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight">
                Welcome <span className="gradient-text">back</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your Glohire workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal cursor-pointer">
                  Keep me signed in for 30 days
                </Label>
              </div>

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
            </form>

            <p className="mt-7 text-center text-xs text-muted-foreground">
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
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SignIn;
