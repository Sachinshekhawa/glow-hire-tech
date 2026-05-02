import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon } from "lucide-react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Missing details", description: "Please enter both your email and password.", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast({ title: "Welcome back 👋", description: "Signed in successfully." });
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your inbox to verify your email, then sign in." });
        setTab("signin");
      }
    } catch (err: any) {
      toast({
        title: tab === "signin" ? "Sign-in failed" : "Sign-up failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Animated ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px] animate-float" />
        <div
          className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/25 blur-[120px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 px-6 py-5 flex items-center justify-between animate-fade-up">
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

      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            border: "1px solid hsl(var(--border))",
            background: "var(--gradient-card)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "var(--shadow-elegant)",
            p: { xs: 3.5, md: 5 },
            overflow: "hidden",
          }}
          className="glow-border"
        >
          {/* Inner glow accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="mb-7 text-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-border bg-card/60 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Secure sign-in
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {tab === "signin" ? <>Welcome <span className="gradient-text">back</span></> : <>Create your <span className="gradient-text">account</span></>}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tab === "signin" ? "Sign in to your Glohire workspace" : "Get started with Glohire in seconds"}
            </p>
          </div>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ mb: 3, "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}
          >
            <Tab value="signin" label="Sign in" />
            <Tab value="signup" label="Sign up" />
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === "signup" && (
              <div className="animate-fade-up">
                <TextField
                  label="Display name"
                  fullWidth
                  placeholder="e.g. Aarav Mehta"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  slotProps={{
                    htmlInput: { maxLength: 80 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
            )}
            <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>

              <TextField
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                slotProps={{
                  htmlInput: { maxLength: 255 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                slotProps={{
                  htmlInput: { maxLength: 128 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors story-link"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div
              className="flex items-center animate-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <span className="text-sm text-muted-foreground">
                    Keep me signed in for 30 days
                  </span>
                }
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.6s" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
                sx={{ height: 48, fontSize: 15 }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </form>

          <div
            className="mt-6 text-center text-sm text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.7s" }}
          >
            New to Glohire?{" "}
            <Link
              to="/#cta"
              className="text-foreground font-medium hover:text-primary transition-colors story-link"
            >
              Book a demo
            </Link>
          </div>
        </Box>

        <p
          className="mt-6 text-center text-xs text-muted-foreground animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          Protected by enterprise-grade encryption · SOC 2 · GDPR
        </p>
      </div>
    </div>
  );
};

export default SignIn;
