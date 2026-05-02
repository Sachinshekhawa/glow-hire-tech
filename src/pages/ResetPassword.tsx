import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Lock, ArrowRight, KeyRound, Eye, EyeOff } from "lucide-react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase will populate session from URL hash on recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "You're now signed in." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Couldn't update password", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px] animate-float" />
        <div
          className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/25 blur-[120px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

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
          <div className="mb-7 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mb-4">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Set a new <span className="gradient-text">password</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {ready
                ? "Choose a strong new password for your account."
                : "Open this page using the reset link from your email."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="New password"
              type={show ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!ready}
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
                      <IconButton size="small" onClick={() => setShow((s) => !s)}>
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm new password"
              type={show ? "text" : "password"}
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={!ready}
              slotProps={{
                htmlInput: { maxLength: 128 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading || !ready}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight className="h-4 w-4" />}
              sx={{ height: 48, fontSize: 15 }}
            >
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default ResetPassword;
