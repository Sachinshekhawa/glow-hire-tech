import { ReactNode, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "./ThemeProvider";
import { buildMuiTheme } from "@/lib/muiTheme";

/**
 * Bridges the existing next-themes-style ThemeProvider (which toggles the
 * `light` / `dark` class on <html>) into MUI's ThemeProvider. The theme is
 * rebuilt on every mode change AND once on mount, so MUI reads the freshly
 * applied CSS variables.
 */
const MuiThemeBridge = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // After CSS variables are applied, rebuild MUI theme so it reads them.
    const id = window.requestAnimationFrame(() => setTick((t) => t + 1));
    return () => window.cancelAnimationFrame(id);
  }, [theme]);

  const muiTheme = useMemo(() => buildMuiTheme(theme), [theme, tick]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default MuiThemeBridge;
