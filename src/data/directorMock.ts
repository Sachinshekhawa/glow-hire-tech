// Mock data for the Director / Head-of-Delivery dashboard. Aggregates
// across multiple managers (each with their own team) so the director can
// drill from manager → recruiter → client relationships. Includes AI vs
// Human interview mix per client to surface delivery-mode preferences.

export type DirectorRecruiter = {
  id: string;
  name: string;
  initials: string;
  role: string;
  jobs: number;
  submissions: number;
  interviews: number;
  aiInterviews: number;
  offers: number;
  joins: number;
  conversionPct: number;
};

export type DirectorManager = {
  id: string;
  name: string;
  initials: string;
  team: string;
  region: string;
  status: "active" | "on-leave" | "offline";
  teamSize: number;
  jobs: number;
  submissions: number;
  interviews: number;
  aiInterviews: number;
  offers: number;
  joins: number;
  revenue: string;
  responseHrs: number;
  conversionPct: number;
  attainmentPct: number; // % of monthly target
  trend: number; // +/- vs last week
  health: "Excellent" | "Healthy" | "Watch" | "At risk";
  recruiters: DirectorRecruiter[];
};

export type DirectorClient = {
  id: string;
  name: string;
  industry: string;
  manager: string; // delivery / account manager
  openJobs: number;
  candidates: number;
  submissions: number;
  humanInterviews: number;
  aiInterviews: number;
  offers: number;
  joins: number;
  health: "Excellent" | "Healthy" | "Watch" | "At risk";
  csat: number;
  revenue: string;
  ytdRevenue: string;
  lastActivity: string;
  preference: "AI-first" | "Human-first" | "Mixed";
};

export type DirectorKpi = {
  id: string;
  label: string;
  value: string | number;
  delta: number;
  trend: "up" | "down" | "flat";
  hint?: string;
};

export const director = {
  name: "Rohan Kapoor",
  initials: "RK",
  role: "Director · Delivery",
  org: "APAC & MEA Tech Delivery",
  managerCount: 4,
  recruiterCount: 22,
  clientCount: 14,
};

export const directorKpis: DirectorKpi[] = [
  { id: "managers",   label: "Managers",            value: 4,      delta: 0,   trend: "flat" },
  { id: "recruiters", label: "Recruiters",          value: 22,     delta: 2,   trend: "up", hint: "2 new this month" },
  { id: "open-jobs",  label: "Open requisitions",   value: 168,    delta: 18,  trend: "up" },
  { id: "subs",       label: "Submissions (MTD)",   value: 842,    delta: 11,  trend: "up" },
  { id: "human-int",  label: "Client interviews",   value: 312,    delta: 7,   trend: "up" },
  { id: "ai-int",     label: "AI interviews",       value: 248,    delta: 34,  trend: "up", hint: "Fastest growing channel" },
  { id: "offers",     label: "Offers extended",     value: 76,     delta: 9,   trend: "up" },
  { id: "joins",      label: "Joined this month",   value: 48,     delta: 4,   trend: "up" },
  { id: "revenue",    label: "Revenue (MTD)",       value: "₹ 4.6 Cr", delta: 12, trend: "up" },
  { id: "csat",       label: "Client CSAT",         value: "4.6 / 5",  delta: 2,  trend: "up" },
  { id: "ttf",        label: "Avg time-to-fill",    value: "16d",  delta: -6,  trend: "down", hint: "Lower is better" },
  { id: "ai-share",   label: "AI interview share",  value: "44%",  delta: 8,   trend: "up", hint: "Of total interviews" },
];

export const managers: DirectorManager[] = [
  {
    id: "M-01",
    name: "Priya Iyer",
    initials: "PI",
    team: "APAC Tech Hiring",
    region: "Bengaluru",
    status: "active",
    teamSize: 6,
    jobs: 47,
    submissions: 218,
    interviews: 84,
    aiInterviews: 63,
    offers: 19,
    joins: 11,
    revenue: "₹ 1.4 Cr",
    responseHrs: 3.6,
    conversionPct: 8.7,
    attainmentPct: 84,
    trend: 12,
    health: "Excellent",
    recruiters: [
      { id: "R-01", name: "Aarav Mehta",  initials: "AM", role: "Sr. Recruiter", jobs: 11, submissions: 48, interviews: 23, aiInterviews: 17, offers: 7, joins: 4, conversionPct: 14.6 },
      { id: "R-02", name: "Neha Verma",   initials: "NV", role: "Recruiter",     jobs: 9,  submissions: 42, interviews: 18, aiInterviews: 12, offers: 4, joins: 3, conversionPct: 9.5 },
      { id: "R-03", name: "Karan Shah",   initials: "KS", role: "Sr. Recruiter", jobs: 8,  submissions: 39, interviews: 15, aiInterviews: 11, offers: 3, joins: 2, conversionPct: 7.7 },
      { id: "R-04", name: "Meera Iyer",   initials: "MI", role: "Recruiter",     jobs: 6,  submissions: 28, interviews: 9,  aiInterviews: 8,  offers: 2, joins: 1, conversionPct: 7.1 },
      { id: "R-05", name: "Vivek Nair",   initials: "VN", role: "Jr. Recruiter", jobs: 7,  submissions: 33, interviews: 12, aiInterviews: 9,  offers: 2, joins: 1, conversionPct: 6.1 },
      { id: "R-06", name: "Tanvi Joshi",  initials: "TJ", role: "Recruiter",     jobs: 6,  submissions: 28, interviews: 7,  aiInterviews: 6,  offers: 1, joins: 0, conversionPct: 3.6 },
    ],
  },
  {
    id: "M-02",
    name: "Sandeep Rao",
    initials: "SR",
    team: "BFSI Delivery",
    region: "Mumbai",
    status: "active",
    teamSize: 5,
    jobs: 38,
    submissions: 196,
    interviews: 78,
    aiInterviews: 41,
    offers: 17,
    joins: 12,
    revenue: "₹ 1.1 Cr",
    responseHrs: 4.2,
    conversionPct: 8.7,
    attainmentPct: 91,
    trend: 7,
    health: "Healthy",
    recruiters: [
      { id: "R-07", name: "Ishita Bose",  initials: "IB", role: "Sr. Recruiter", jobs: 10, submissions: 52, interviews: 22, aiInterviews: 11, offers: 6, joins: 4, conversionPct: 11.5 },
      { id: "R-08", name: "Rahul Khanna", initials: "RK", role: "Recruiter",     jobs: 8,  submissions: 41, interviews: 17, aiInterviews: 9,  offers: 4, joins: 3, conversionPct: 9.7 },
      { id: "R-09", name: "Sneha Pillai", initials: "SP", role: "Recruiter",     jobs: 7,  submissions: 38, interviews: 14, aiInterviews: 8,  offers: 3, joins: 2, conversionPct: 7.9 },
      { id: "R-10", name: "Aman Gupta",   initials: "AG", role: "Jr. Recruiter", jobs: 7,  submissions: 36, interviews: 14, aiInterviews: 7,  offers: 2, joins: 2, conversionPct: 5.5 },
      { id: "R-11", name: "Divya Menon",  initials: "DM", role: "Recruiter",     jobs: 6,  submissions: 29, interviews: 11, aiInterviews: 6,  offers: 2, joins: 1, conversionPct: 6.8 },
    ],
  },
  {
    id: "M-03",
    name: "Lakshmi Reddy",
    initials: "LR",
    team: "AI & Data Practice",
    region: "Hyderabad",
    status: "active",
    teamSize: 6,
    jobs: 52,
    submissions: 244,
    interviews: 96,
    aiInterviews: 112,
    offers: 24,
    joins: 16,
    revenue: "₹ 1.5 Cr",
    responseHrs: 2.8,
    conversionPct: 9.8,
    attainmentPct: 102,
    trend: 18,
    health: "Excellent",
    recruiters: [
      { id: "R-12", name: "Aditya Roy",   initials: "AR", role: "Sr. Recruiter", jobs: 12, submissions: 56, interviews: 24, aiInterviews: 28, offers: 8, joins: 6, conversionPct: 14.2 },
      { id: "R-13", name: "Pooja Singh",  initials: "PS", role: "Sr. Recruiter", jobs: 10, submissions: 48, interviews: 20, aiInterviews: 22, offers: 5, joins: 4, conversionPct: 10.4 },
      { id: "R-14", name: "Rohit Jain",   initials: "RJ", role: "Recruiter",     jobs: 9,  submissions: 42, interviews: 17, aiInterviews: 19, offers: 4, joins: 2, conversionPct: 9.5 },
      { id: "R-15", name: "Kavya Rao",    initials: "KR", role: "Recruiter",     jobs: 8,  submissions: 38, interviews: 14, aiInterviews: 18, offers: 3, joins: 2, conversionPct: 7.8 },
      { id: "R-16", name: "Mehul Shah",   initials: "MS", role: "Jr. Recruiter", jobs: 7,  submissions: 32, interviews: 12, aiInterviews: 14, offers: 2, joins: 1, conversionPct: 6.2 },
      { id: "R-17", name: "Nitya Das",    initials: "ND", role: "Recruiter",     jobs: 6,  submissions: 28, interviews: 9,  aiInterviews: 11, offers: 2, joins: 1, conversionPct: 7.1 },
    ],
  },
  {
    id: "M-04",
    name: "Faisal Ahmed",
    initials: "FA",
    team: "MEA Enterprise",
    region: "Dubai",
    status: "active",
    teamSize: 5,
    jobs: 31,
    submissions: 184,
    interviews: 54,
    aiInterviews: 32,
    offers: 16,
    joins: 9,
    revenue: "₹ 0.6 Cr",
    responseHrs: 5.1,
    conversionPct: 8.7,
    attainmentPct: 71,
    trend: -4,
    health: "Watch",
    recruiters: [
      { id: "R-18", name: "Yousef Khan",  initials: "YK", role: "Sr. Recruiter", jobs: 9,  submissions: 46, interviews: 16, aiInterviews: 9, offers: 5, joins: 3, conversionPct: 10.9 },
      { id: "R-19", name: "Sara Malik",   initials: "SM", role: "Recruiter",     jobs: 7,  submissions: 38, interviews: 12, aiInterviews: 7, offers: 4, joins: 2, conversionPct: 10.5 },
      { id: "R-20", name: "Omar Faruk",   initials: "OF", role: "Recruiter",     jobs: 6,  submissions: 34, interviews: 10, aiInterviews: 6, offers: 3, joins: 2, conversionPct: 8.8 },
      { id: "R-21", name: "Layla Hadi",   initials: "LH", role: "Jr. Recruiter", jobs: 5,  submissions: 32, interviews: 9,  aiInterviews: 5, offers: 2, joins: 1, conversionPct: 6.3 },
      { id: "R-22", name: "Hassan Ali",   initials: "HA", role: "Recruiter",     jobs: 4,  submissions: 34, interviews: 7,  aiInterviews: 5, offers: 2, joins: 1, conversionPct: 5.9 },
    ],
  },
];

export const directorClients: DirectorClient[] = [
  { id: "C-01", name: "Northwind Bank",   industry: "Banking & Finance", manager: "Sandeep Rao",     openJobs: 14, candidates: 96, submissions: 68, humanInterviews: 31, aiInterviews: 12, offers: 9,  joins: 6, health: "Excellent", csat: 4.8, revenue: "₹ 84 L", ytdRevenue: "₹ 6.2 Cr", lastActivity: "2h ago",     preference: "Human-first" },
  { id: "C-02", name: "Helios AI",        industry: "AI / ML",           manager: "Lakshmi Reddy",   openJobs: 18, candidates: 124, submissions: 84, humanInterviews: 18, aiInterviews: 56, offers: 12, joins: 8, health: "Excellent", csat: 4.7, revenue: "₹ 96 L", ytdRevenue: "₹ 5.8 Cr", lastActivity: "1h ago",     preference: "AI-first" },
  { id: "C-03", name: "Acme Cloud",       industry: "Cloud Infrastructure", manager: "Priya Iyer",   openJobs: 11, candidates: 78, submissions: 52, humanInterviews: 22, aiInterviews: 24, offers: 7,  joins: 5, health: "Healthy",   csat: 4.5, revenue: "₹ 72 L", ytdRevenue: "₹ 4.9 Cr", lastActivity: "5h ago",     preference: "Mixed" },
  { id: "C-04", name: "Quantum Labs",     industry: "Deeptech",          manager: "Lakshmi Reddy",   openJobs: 9,  candidates: 64, submissions: 41, humanInterviews: 12, aiInterviews: 38, offers: 6,  joins: 4, health: "Healthy",   csat: 4.6, revenue: "₹ 64 L", ytdRevenue: "₹ 4.1 Cr", lastActivity: "Yesterday", preference: "AI-first" },
  { id: "C-05", name: "Lumen Health",     industry: "Healthtech",        manager: "Priya Iyer",      openJobs: 7,  candidates: 48, submissions: 31, humanInterviews: 18, aiInterviews: 8,  offers: 4,  joins: 2, health: "Watch",     csat: 4.1, revenue: "₹ 41 L", ytdRevenue: "₹ 2.6 Cr", lastActivity: "Yesterday", preference: "Human-first" },
  { id: "C-06", name: "Atlas Motors",     industry: "Automotive",        manager: "Faisal Ahmed",    openJobs: 4,  candidates: 26, submissions: 18, humanInterviews: 9,  aiInterviews: 4,  offers: 1,  joins: 0, health: "At risk",   csat: 3.6, revenue: "₹ 18 L", ytdRevenue: "₹ 1.4 Cr", lastActivity: "5d ago",     preference: "Human-first" },
  { id: "C-07", name: "Skyline Telecom",  industry: "Telecom",           manager: "Faisal Ahmed",    openJobs: 8,  candidates: 52, submissions: 36, humanInterviews: 14, aiInterviews: 16, offers: 4,  joins: 3, health: "Healthy",   csat: 4.4, revenue: "₹ 38 L", ytdRevenue: "₹ 2.2 Cr", lastActivity: "3h ago",     preference: "Mixed" },
  { id: "C-08", name: "Polaris Retail",   industry: "Retail / E-com",    manager: "Sandeep Rao",     openJobs: 6,  candidates: 42, submissions: 28, humanInterviews: 16, aiInterviews: 6,  offers: 3,  joins: 2, health: "Healthy",   csat: 4.3, revenue: "₹ 32 L", ytdRevenue: "₹ 2.0 Cr", lastActivity: "Today",     preference: "Human-first" },
  { id: "C-09", name: "Verge Robotics",   industry: "Robotics",          manager: "Lakshmi Reddy",   openJobs: 5,  candidates: 34, submissions: 22, humanInterviews: 6,  aiInterviews: 28, offers: 3,  joins: 2, health: "Healthy",   csat: 4.6, revenue: "₹ 28 L", ytdRevenue: "₹ 1.8 Cr", lastActivity: "Today",     preference: "AI-first" },
  { id: "C-10", name: "Orbit Insurance",  industry: "Insurance",         manager: "Sandeep Rao",     openJobs: 6,  candidates: 38, submissions: 24, humanInterviews: 12, aiInterviews: 6,  offers: 3,  joins: 2, health: "Watch",     csat: 4.0, revenue: "₹ 26 L", ytdRevenue: "₹ 1.7 Cr", lastActivity: "2d ago",     preference: "Human-first" },
];

export const directorTrend = [
  { week: "W1", submissions: 184, humanInterviews: 64, aiInterviews: 38, offers: 14 },
  { week: "W2", submissions: 212, humanInterviews: 71, aiInterviews: 52, offers: 16 },
  { week: "W3", submissions: 198, humanInterviews: 78, aiInterviews: 64, offers: 19 },
  { week: "W4", submissions: 248, humanInterviews: 99, aiInterviews: 94, offers: 27 },
];

export const directorAlerts = [
  { id: "A1", level: "warning",  message: "MEA Enterprise attainment at 71% — 9 days remaining", owner: "Faisal Ahmed", when: "Today" },
  { id: "A2", level: "critical", message: "Atlas Motors CSAT dropped to 3.6 — schedule review",  owner: "Faisal Ahmed", when: "1d ago" },
  { id: "A3", level: "info",     message: "Helios AI requested 12 more AI interview slots",      owner: "Lakshmi Reddy", when: "2h ago" },
  { id: "A4", level: "warning",  message: "Lumen Health response time slipped to 18h",          owner: "Priya Iyer",   when: "5h ago" },
  { id: "A5", level: "info",     message: "Quantum Labs renewed contract · ₹1.2 Cr ARR",         owner: "Lakshmi Reddy", when: "Yesterday" },
];
