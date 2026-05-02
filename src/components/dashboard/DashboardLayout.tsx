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
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardSwitcher from "@/components/dashboard/DashboardSwitcher";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import { DateRangeProvider } from "@/lib/dateRange";
import { recruiter } from "@/data/dashboardMock";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", to: "/jobs", icon: Briefcase },
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
    <DateRangeProvider>
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar (custom, not MUI Drawer because it's permanent + uses layout grid) */}
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
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ gap: 1.5, px: { xs: 2, md: 4 }, minHeight: 64 }}>
            <div className="lg:hidden flex items-center gap-2">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display font-bold">
                Glo<span className="gradient-text">hire</span>
              </span>
            </div>

            <div className="hidden md:flex flex-1 max-w-md relative items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <InputBase
                placeholder="Search jobs, candidates, clients…"
                sx={{
                  width: "100%",
                  pl: 5,
                  pr: 2,
                  height: 40,
                  borderRadius: 2,
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--muted) / 0.4)",
                  fontSize: 14,
                }}
              />
            </div>

            <div className="flex-1 md:hidden" />

            <DashboardSwitcher />

            <DateRangeFilter />

            <Button
              component={Link}
              to="/create-job"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Plus className="h-4 w-4" />}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              New job
            </Button>
            <ThemeToggle />
            <IconButton aria-label="Notifications" sx={{ border: "1px solid hsl(var(--border))", borderRadius: 1.25, width: 36, height: 36 }}>
              <Badge variant="dot" color="primary" overlap="circular">
                <Bell className="h-4 w-4" />
              </Badge>
            </IconButton>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{recruiter.initials}</Avatar>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-medium">{recruiter.name}</div>
                <div className="text-xs text-muted-foreground">{recruiter.role}</div>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
    </DateRangeProvider>
  );
};

export default DashboardLayout;
