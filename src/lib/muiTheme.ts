import { createTheme, type Theme } from "@mui/material/styles";

/**
 * MUI theme bridge.
 *
 * Reads the live HSL CSS variables defined in src/index.css so MUI components
 * inherit the exact same design tokens as the rest of the app (Tailwind +
 * shadcn). Recreate the theme whenever the active mode changes so palette
 * values stay in sync with light/dark token sets.
 */

type Mode = "light" | "dark";

const readVar = (name: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

const hsl = (name: string, fallback: string, alpha?: number): string => {
  const triplet = readVar(name, fallback);
  return alpha === undefined ? `hsl(${triplet})` : `hsl(${triplet} / ${alpha})`;
};

export const buildMuiTheme = (mode: Mode): Theme => {
  const isDark = mode === "dark";

  const primaryMain = hsl("--primary", isDark ? "187 100% 55%" : "187 92% 38%");
  const primaryFg = hsl(
    "--primary-foreground",
    isDark ? "230 50% 6%" : "0 0% 100%",
  );
  const accentMain = hsl("--accent", isDark ? "265 89% 70%" : "265 80% 55%");
  const accentFg = hsl(
    "--accent-foreground",
    isDark ? "230 50% 6%" : "0 0% 100%",
  );
  const bg = hsl("--background", isDark ? "230 35% 5%" : "0 0% 100%");
  const card = hsl("--card", isDark ? "230 30% 8%" : "0 0% 100%");
  const fg = hsl("--foreground", isDark ? "210 40% 98%" : "222 30% 11%");
  const muted = hsl("--muted", isDark ? "230 25% 14%" : "220 20% 96%");
  const mutedFg = hsl(
    "--muted-foreground",
    isDark ? "220 15% 65%" : "220 12% 42%",
  );
  const border = hsl("--border", isDark ? "230 25% 16%" : "220 15% 90%");
  const destructive = hsl(
    "--destructive",
    isDark ? "0 84% 60%" : "0 84% 55%",
  );
  const radiusRem = readVar("--radius", "0.875rem");
  const radiusPx = (() => {
    const n = parseFloat(radiusRem);
    if (Number.isNaN(n)) return 14;
    return radiusRem.endsWith("rem") ? n * 16 : n;
  })();

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain, contrastText: primaryFg },
      secondary: { main: accentMain, contrastText: accentFg },
      error: { main: destructive },
      background: { default: bg, paper: card },
      text: { primary: fg, secondary: mutedFg, disabled: mutedFg },
      divider: border,
      action: {
        hover: muted,
        selected: muted,
        disabledBackground: muted,
        focus: muted,
      },
    },
    shape: { borderRadius: radiusPx },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      h1: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 700 },
      h2: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 700 },
      h3: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 700 },
      h4: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 },
      h5: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 },
      h6: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
            color: fg,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: card,
            color: fg,
            borderRadius: radiusPx,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "var(--gradient-card)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${border}`,
            boxShadow: "var(--shadow-card)",
            borderRadius: radiusPx,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 16,
            fontWeight: 600,
          },
          containedPrimary: {
            background: "var(--gradient-primary)",
            color: primaryFg,
            boxShadow: "var(--shadow-glow)",
            "&:hover": {
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-violet)",
              transform: "scale(1.02)",
            },
            transition: "all 0.3s var(--transition-smooth)",
          },
          outlined: {
            borderColor: border,
            color: fg,
            "&:hover": { backgroundColor: muted, borderColor: primaryMain },
          },
          text: {
            color: fg,
            "&:hover": { backgroundColor: muted },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: fg,
            "&:hover": { backgroundColor: muted },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: muted,
            borderRadius: 10,
            "& fieldset": { borderColor: border },
            "&:hover fieldset": { borderColor: primaryMain },
            "&.Mui-focused fieldset": { borderColor: primaryMain },
          },
          input: { color: fg },
        },
      },
      MuiInputBase: {
        styleOverrides: { input: { color: fg } },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: mutedFg } },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: muted,
            color: fg,
            border: `1px solid ${border}`,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: hsl("--primary", "187 100% 55%", 0.12),
            color: primaryMain,
            borderColor: hsl("--primary", "187 100% 55%", 0.3),
          },
          colorSecondary: {
            backgroundColor: hsl("--accent", "265 89% 70%", 0.12),
            color: accentMain,
            borderColor: hsl("--accent", "265 89% 70%", 0.3),
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: border } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: border, color: fg },
          head: { color: mutedFg, fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em" },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: card,
            color: fg,
            border: `1px solid ${border}`,
            fontSize: 12,
            boxShadow: "var(--shadow-card)",
          },
          arrow: { color: card },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            background: "var(--gradient-primary)",
            color: primaryFg,
            fontWeight: 600,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: muted, borderRadius: 999, height: 8 },
          bar: { background: "var(--gradient-primary)", borderRadius: 999 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: hsl("--background", isDark ? "230 35% 5%" : "0 0% 100%", 0.8),
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: fg,
            borderBottom: `1px solid ${border}`,
            boxShadow: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: card,
            color: fg,
            borderRight: `1px solid ${border}`,
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: card,
            border: `1px solid ${border}`,
            boxShadow: "var(--shadow-card)",
          },
        },
      },
    },
  });
};
