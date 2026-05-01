import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type DateRangeKey =
  | "all"
  | "today"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "last-year";

export const DATE_RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "last-week", label: "Last week" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-year", label: "This year" },
  { value: "last-year", label: "Last year" },
];

/**
 * Consistent scaling factor applied to mock numeric metrics so the entire
 * dashboard visibly reacts to the selected range. In production, swap this
 * for real time-bounded API queries — the context API stays the same.
 */
export const RANGE_FACTORS: Record<DateRangeKey, number> = {
  all: 1,
  today: 0.06,
  "this-week": 0.22,
  "last-week": 0.18,
  "this-month": 0.55,
  "last-month": 0.48,
  "this-year": 0.92,
  "last-year": 0.78,
};

type Bounds = { start: Date | null; end: Date | null };

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const computeBounds = (key: DateRangeKey, now = new Date()): Bounds => {
  const today = startOfDay(now);
  const day = today.getDay(); // 0=Sun
  const mondayOffset = (day + 6) % 7; // days since Monday
  const weekStart = addDays(today, -mondayOffset);
  const month = today.getMonth();
  const year = today.getFullYear();

  switch (key) {
    case "all":
      return { start: null, end: null };
    case "today":
      return { start: today, end: addDays(today, 1) };
    case "this-week":
      return { start: weekStart, end: addDays(weekStart, 7) };
    case "last-week":
      return { start: addDays(weekStart, -7), end: weekStart };
    case "this-month":
      return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
    case "last-month":
      return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
    case "this-year":
      return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
    case "last-year":
      return { start: new Date(year - 1, 0, 1), end: new Date(year, 0, 1) };
  }
};

type Ctx = {
  range: DateRangeKey;
  setRange: (r: DateRangeKey) => void;
  factor: number;
  bounds: Bounds;
  label: string;
  /** Scale a numeric metric and round nicely. */
  scale: (n: number) => number;
  /** Filter an array by an ISO date field (returns all when range = "all"). */
  filterByDate: <T>(items: T[], getDate: (item: T) => string | Date | null | undefined) => T[];
};

const DateRangeContext = createContext<Ctx | null>(null);

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRangeKey>("all");

  const value = useMemo<Ctx>(() => {
    const factor = RANGE_FACTORS[range];
    const bounds = computeBounds(range);
    const label = DATE_RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "All time";

    const scale = (n: number) => {
      if (factor === 1) return n;
      const v = n * factor;
      return v >= 10 ? Math.round(v) : Math.max(0, Math.round(v * 10) / 10);
    };

    const filterByDate = <T,>(items: T[], getDate: (item: T) => string | Date | null | undefined) => {
      if (!bounds.start || !bounds.end) return items;
      const s = bounds.start.getTime();
      const e = bounds.end.getTime();
      return items.filter((it) => {
        const raw = getDate(it);
        if (!raw) return false;
        const t = (raw instanceof Date ? raw : new Date(raw)).getTime();
        return !Number.isNaN(t) && t >= s && t < e;
      });
    };

    return { range, setRange, factor, bounds, label, scale, filterByDate };
  }, [range]);

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
};

export const useDateRange = () => {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside DateRangeProvider");
  return ctx;
};
