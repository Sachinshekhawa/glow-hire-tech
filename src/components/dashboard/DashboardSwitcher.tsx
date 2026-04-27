import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Users, UserRound, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardSwitcher = () => {
  const location = useLocation();
  const isManager = location.pathname.startsWith("/dashboard/manager");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const current = isManager
    ? { label: "Manager view", icon: Users }
    : { label: "Recruiter view", icon: UserRound };
  const Icon = current.icon;

  return (
    <>
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card/50 hover:bg-muted transition-colors text-sm"
      >
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
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 256, mt: 1 } } }}
      >
        <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Switch dashboard
        </div>
        <Divider />
        <MenuItem
          component={Link}
          to="/dashboard"
          onClick={() => setAnchorEl(null)}
          sx={{ alignItems: "flex-start", gap: 1.5, py: 1.25 }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary shrink-0">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-medium">Recruiter view</div>
            <div className="text-xs text-muted-foreground">My jobs, interviews, offers</div>
          </div>
        </MenuItem>
        <MenuItem
          component={Link}
          to="/dashboard/manager"
          onClick={() => setAnchorEl(null)}
          sx={{ alignItems: "flex-start", gap: 1.5, py: 1.25 }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
            <Users className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-medium">Manager view</div>
            <div className="text-xs text-muted-foreground">Team performance & client scorecards</div>
          </div>
        </MenuItem>
      </Menu>
    </>
  );
};

export default DashboardSwitcher;
