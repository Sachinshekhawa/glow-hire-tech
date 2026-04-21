import { Sparkles, Twitter, Linkedin, Github } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: ["AI Recruiter", "Unified Inbox", "AI Interviews", "Assessments", "Workflow Builder", "Analytics"],
  },
  {
    title: "Solutions",
    links: ["Staffing Agencies", "Enterprise HR", "Tech Hiring", "Volume Hiring", "Global Hiring"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Docs", "API Reference", "Blog", "Changelog", "Security"],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container py-16">
        <div className="grid lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display text-xl font-bold">
                Glo<span className="gradient-text">hire</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The autonomous AI recruiter and multi-channel hiring OS for modern teams.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Glohire, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">DPA</a>
            <a href="#" className="hover:text-foreground">SOC 2</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
