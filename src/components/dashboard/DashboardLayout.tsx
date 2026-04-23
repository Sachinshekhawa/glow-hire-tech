import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarClock,
  Bot,
  Send,
  Award,
  Settings,
  Search,
  Bell,
  Plus,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardSwitcher from "@/components/dashboard/DashboardSwitcher";
import { recruiter } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", to: "/dashboard?tab=jobs", icon: Briefcase },
  { label: "Candidates", to: "/dashboard?tab=candidates", icon: Users },
  { label: "Interviews", to: "/dashboard?tab=interviews", icon: CalendarClock },
  { label: "AI Interviews", to: "/dashboard?tab=ai", icon: Bot },
  { label: "Submissions", to: "/dashboard?tab=submissions", icon: Send },
  { label: "Offers", to: "/dashboard?tab=offers", icon: Award },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isActive = (to: string) =>
    location.pathname + location.search === to ||
    (to === "/dashboard" && location.pathname === "/dashboard" && !location.search);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Glo<span className="gradient-text">hire</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            to="/admin/system-behavior"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
          <Link
            to="/signin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-8">
          <div className="lg:hidden flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display font-bold">
              Glo<span className="gradient-text">hire</span>
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, candidates, clients…"
              className="pl-10 h-10 bg-muted/40 border-border"
            />
          </div>

          <div className="flex-1 md:hidden" />

          <DashboardSwitcher />

          <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
            <Link to="/create-job">
              <Plus className="h-4 w-4" />
              New job
            </Link>
          </Button>
          <ThemeToggle />
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                {recruiter.initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block leading-tight">
              <div className="text-sm font-medium">{recruiter.name}</div>
              <div className="text-xs text-muted-foreground">{recruiter.role}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
