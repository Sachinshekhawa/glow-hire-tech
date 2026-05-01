import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    }, 1000);
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
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="mb-7 text-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mb-4 animate-glow-pulse">
              {sent ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <KeyRound className="h-5 w-5 text-primary" />
              )}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {sent ? (
                <>Check your <span className="gradient-text">inbox</span></>
              ) : (
                <>Reset your <span className="gradient-text">password</span></>
              )}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {sent
                ? `We've sent a reset link to ${email}. It may take a minute to arrive.`
                : "Enter your email and we'll send you a secure link to reset your password."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputProps={{ maxLength: 255 }}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
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
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => setSent(false)}
                sx={{ height: 48 }}
              >
                Use a different email
              </Button>
            </div>
          )}

          <div
            className="mt-6 text-center text-sm text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 text-foreground font-medium hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </Box>

        <p
          className="mt-6 text-center text-xs text-muted-foreground animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          For security, the link will expire in 30 minutes.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
