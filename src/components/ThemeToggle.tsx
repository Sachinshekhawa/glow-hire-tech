import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className}`}
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? "scale-0 -rotate-90 absolute" : "scale-100 rotate-0"}`} />
      <Moon className={`h-4 w-4 transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90 absolute"}`} />
    </button>
  );
};

export default ThemeToggle;
