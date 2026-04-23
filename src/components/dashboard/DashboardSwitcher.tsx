import { Link, useLocation } from "react-router-dom";
import { Users, UserRound, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DashboardSwitcher = () => {
  const location = useLocation();
  const isManager = location.pathname.startsWith("/dashboard/manager");

  const current = isManager
    ? { label: "Manager view", icon: Users, sub: "Team & client analytics" }
    : { label: "Recruiter view", icon: UserRound, sub: "My pipeline" };
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card/50 hover:bg-muted transition-colors text-sm">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            isManager ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="hidden md:inline font-medium">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Switch dashboard
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-start gap-3 cursor-pointer">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary shrink-0">
              <UserRound className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-medium">Recruiter view</div>
              <div className="text-xs text-muted-foreground">My jobs, interviews, offers</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/manager" className="flex items-start gap-3 cursor-pointer">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
              <Users className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-medium">Manager view</div>
              <div className="text-xs text-muted-foreground">Team performance & client scorecards</div>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardSwitcher;
