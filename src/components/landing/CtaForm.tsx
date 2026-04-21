import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().min(1, "Company is required").max(120),
  volume: z.string().min(1, "Select hiring volume"),
  channels: z.string().trim().max(200).optional(),
});

const CtaForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [volume, setVolume] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || ""),
      volume,
      channels: String(fd.get("channels") || ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrs[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrs);
      return;
    }
    setErrors({});
    setSubmitted(true);
    toast({
      title: "You're in. 🚀",
      description: "A Glohire specialist will reach out within 24 hours.",
    });
  };

  return (
    <section id="cta" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Build your <span className="gradient-text">autonomous hiring engine</span> today.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Tell us about your hiring needs. We'll show you a tailored Glohire setup
              and walk you through your ROI in 30 minutes.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Personalized live demo",
                "Custom workflow blueprint for your team",
                "ROI calculator with your numbers",
              ].map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-elegant">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                  <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">You're on the list.</h3>
                <p className="mt-2 text-muted-foreground">
                  A Glohire specialist will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Jane Doe" maxLength={100} className="mt-1.5" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" name="email" type="email" placeholder="jane@company.com" maxLength={255} className="mt-1.5" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" placeholder="Acme Inc." maxLength={120} className="mt-1.5" />
                  {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
                </div>
                <div>
                  <Label htmlFor="volume">Hiring volume / month</Label>
                  <Select value={volume} onValueChange={setVolume}>
                    <SelectTrigger id="volume" className="mt-1.5">
                      <SelectValue placeholder="Select volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1 – 10 hires</SelectItem>
                      <SelectItem value="10-50">10 – 50 hires</SelectItem>
                      <SelectItem value="50-200">50 – 200 hires</SelectItem>
                      <SelectItem value="200+">200+ hires</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.volume && <p className="text-xs text-destructive mt-1">{errors.volume}</p>}
                </div>
                <div>
                  <Label htmlFor="channels">Channels you use today</Label>
                  <Input id="channels" name="channels" placeholder="Email, LinkedIn, WhatsApp..." maxLength={200} className="mt-1.5" />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Book my demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  By submitting you agree to our Terms and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaForm;
