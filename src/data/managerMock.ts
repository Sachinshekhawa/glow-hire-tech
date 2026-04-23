// Mock data layer for the recruiter manager dashboard. Aggregates team-level
// performance, per-recruiter contributions and per-client scorecards. Kept
// separate from `dashboardMock` so individual-recruiter widgets stay focused.

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: "active" | "on-leave" | "offline";
  jobs: number;
  submissions: number;
  interviews: number;
  aiInterviews: number;
  offers: number;
  joins: number;
  responseHrs: number;
  conversionPct: number; // submission → offer %
  trend: number; // +/- vs last week
};

export type ClientScorecard = {
  id: string;
  name: string;
  industry: string;
  owner: string; // account manager
  openJobs: number;
  candidates: number; // unique candidates supplied
  submissions: number;
  interviews: number;
  offers: number;
  joins: number;
  health: "Excellent" | "Healthy" | "Watch" | "At risk";
  revenue: string;
  lastActivity: string;
};

export type ManagerKpi = {
  id: string;
  label: string;
  value: string | number;
  delta: number;
  trend: "up" | "down" | "flat";
  hint?: string;
};

export type ManagerActivity = {
  id: string;
  who: string;
  message: string;
  when: string;
  kind: "submission" | "interview" | "offer" | "client" | "ai" | "alert";
};

export const manager = {
  name: "Priya Iyer",
  initials: "PI",
  role: "Recruitment Manager",
  team: "APAC Tech Hiring",
  teamSize: 6,
};

export const managerKpis: ManagerKpi[] = [
  { id: "team-jobs", label: "Team open jobs", value: 47, delta: 9, trend: "up", hint: "Across 6 recruiters" },
  { id: "team-subs", label: "Submissions (MTD)", value: 218, delta: 14, trend: "up" },
  { id: "team-interviews", label: "Client interviews", value: 84, delta: 6, trend: "up", hint: "Next 14 days" },
  { id: "team-ai", label: "AI interviews", value: 63, delta: 22, trend: "up" },
  { id: "team-offers", label: "Offers extended", value: 19, delta: 3, trend: "up" },
  { id: "team-joins", label: "Joined this month", value: 11, delta: -1, trend: "down" },
  { id: "ttf", label: "Avg time-to-fill", value: "17d", delta: -8, trend: "down", hint: "Lower is better" },
  { id: "accept", label: "Offer acceptance", value: "74%", delta: 3, trend: "up" },
];

export const teamMembers: TeamMember[] = [
  { id: "R-01", name: "Aarav Mehta",   initials: "AM", role: "Sr. Recruiter",  status: "active",   jobs: 11, submissions: 48, interviews: 23, aiInterviews: 17, offers: 7, joins: 4, responseHrs: 3.2, conversionPct: 14.6, trend: 12 },
  { id: "R-02", name: "Neha Verma",    initials: "NV", role: "Recruiter",      status: "active",   jobs: 9,  submissions: 42, interviews: 18, aiInterviews: 12, offers: 4, joins: 3, responseHrs: 4.1, conversionPct: 9.5,  trend: 6  },
  { id: "R-03", name: "Karan Shah",    initials: "KS", role: "Sr. Recruiter",  status: "active",   jobs: 8,  submissions: 39, interviews: 15, aiInterviews: 11, offers: 3, joins: 2, responseHrs: 2.8, conversionPct: 7.7,  trend: -3 },
  { id: "R-04", name: "Meera Iyer",    initials: "MI", role: "Recruiter",      status: "on-leave", jobs: 6,  submissions: 28, interviews: 9,  aiInterviews: 8,  offers: 2, joins: 1, responseHrs: 5.6, conversionPct: 7.1,  trend: 0  },
  { id: "R-05", name: "Vivek Nair",    initials: "VN", role: "Jr. Recruiter",  status: "active",   jobs: 7,  submissions: 33, interviews: 12, aiInterviews: 9,  offers: 2, joins: 1, responseHrs: 3.9, conversionPct: 6.1,  trend: 4  },
  { id: "R-06", name: "Tanvi Joshi",   initials: "TJ", role: "Recruiter",      status: "offline",  jobs: 6,  submissions: 28, interviews: 7,  aiInterviews: 6,  offers: 1, joins: 0, responseHrs: 6.2, conversionPct: 3.6,  trend: -8 },
];

export const clientScorecards: ClientScorecard[] = [
  { id: "C-01", name: "Northwind Bank", industry: "Banking & Finance", owner: "Aarav Mehta", openJobs: 9,  candidates: 64, submissions: 41, interviews: 19, offers: 6, joins: 4, health: "Excellent", revenue: "₹ 84 L", lastActivity: "2h ago" },
  { id: "C-02", name: "Acme Cloud",     industry: "Cloud Infrastructure", owner: "Karan Shah", openJobs: 7, candidates: 52, submissions: 33, interviews: 15, offers: 4, joins: 3, health: "Healthy",   revenue: "₹ 62 L", lastActivity: "5h ago" },
  { id: "C-03", name: "Helios AI",      industry: "AI / ML", owner: "Neha Verma", openJobs: 6, candidates: 48, submissions: 29, interviews: 12, offers: 3, joins: 2, health: "Healthy",   revenue: "₹ 58 L", lastActivity: "Yesterday" },
  { id: "C-04", name: "Lumen Health",   industry: "Healthtech", owner: "Vivek Nair", openJobs: 5, candidates: 31, submissions: 22, interviews: 9,  offers: 2, joins: 1, health: "Watch",     revenue: "₹ 41 L", lastActivity: "Yesterday" },
  { id: "C-05", name: "Quantum Labs",   industry: "Deeptech", owner: "Tanvi Joshi", openJobs: 4, candidates: 22, submissions: 15, interviews: 6,  offers: 1, joins: 0, health: "Watch",     revenue: "₹ 28 L", lastActivity: "2d ago" },
  { id: "C-06", name: "Atlas Motors",   industry: "Automotive", owner: "Meera Iyer", openJobs: 3, candidates: 14, submissions: 10, interviews: 3,  offers: 0, joins: 0, health: "At risk",   revenue: "₹ 12 L", lastActivity: "5d ago" },
];

export const teamSubmissionsTrend = [
  { day: "Mon", submissions: 28, interviews: 11 },
  { day: "Tue", submissions: 36, interviews: 14 },
  { day: "Wed", submissions: 31, interviews: 12 },
  { day: "Thu", submissions: 44, interviews: 18 },
  { day: "Fri", submissions: 39, interviews: 16 },
  { day: "Sat", submissions: 22, interviews: 7 },
  { day: "Sun", submissions: 18, interviews: 6 },
];

export const teamPipeline = [
  { stage: "Sourced", count: 1240 },
  { stage: "Screened", count: 712 },
  { stage: "Submitted", count: 218 },
  { stage: "Interview", count: 84 },
  { stage: "Offer", count: 19 },
  { stage: "Joined", count: 11 },
];

export const interviewMix = {
  scheduled: 58,
  inProgress: 9,
  completed: 71,
  noShow: 6,
  rescheduled: 11,
  cancelled: 4,
};

export const aiInterviewMix = {
  scheduled: 24,
  inProgress: 7,
  completed: 28,
  expired: 4,
};

export const managerActivity: ManagerActivity[] = [
  { id: "M1", who: "Aarav Mehta",  message: "closed an offer with Northwind Bank for Sr. Java Developer", when: "1h ago", kind: "offer" },
  { id: "M2", who: "Neha Verma",   message: "submitted 4 candidates to Helios AI for Data Scientist", when: "3h ago", kind: "submission" },
  { id: "M3", who: "Karan Shah",   message: "scheduled 3 client interviews with Acme Cloud", when: "4h ago", kind: "interview" },
  { id: "M4", who: "System",       message: "Lumen Health response time slipped to 18h — needs attention", when: "Today", kind: "alert" },
  { id: "M5", who: "Vivek Nair",   message: "completed 5 AI interviews for DevOps Engineer pipeline", when: "Yesterday", kind: "ai" },
  { id: "M6", who: "Tanvi Joshi",  message: "onboarded new client Quantum Labs · 4 new reqs", when: "2d ago", kind: "client" },
];

export const goals = [
  { id: "g1", label: "Monthly submissions", value: 218, target: 260, unit: "" },
  { id: "g2", label: "Offers extended",     value: 19,  target: 24,  unit: "" },
  { id: "g3", label: "Joins",               value: 11,  target: 16,  unit: "" },
  { id: "g4", label: "Offer acceptance",    value: 74,  target: 80,  unit: "%" },
];
