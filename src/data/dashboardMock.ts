// Mock data layer for the recruiter dashboard. In production this would be
// replaced by API/Cloud calls. Kept centralized so individual widgets stay lean.

export type RecruiterProfile = {
  name: string;
  initials: string;
  role: string;
  team: string;
};

export type KpiTrend = "up" | "down" | "flat";

export type Kpi = {
  id: string;
  label: string;
  value: number;
  delta: number; // % vs last period
  trend: KpiTrend;
  hint?: string;
};

export type Job = {
  id: string;
  title: string;
  client: string;
  location: string;
  type: "Full-time" | "Contract" | "Part-time" | "Internship";
  status: "Open" | "On hold" | "Closed";
  priority: "High" | "Medium" | "Low";
  positions: number;
  filled: number;
  ageDays: number;
  assignedTo: "me" | "team";
};

export type InterviewStatus =
  | "Scheduled"
  | "In progress"
  | "Completed"
  | "No-show"
  | "Rescheduled"
  | "Cancelled";

export type Interview = {
  id: string;
  candidate: string;
  role: string;
  client: string;
  when: string; // ISO
  round: string;
  mode: "Onsite" | "Virtual" | "Phone";
  status: InterviewStatus;
};

export type AiInterview = {
  id: string;
  candidate: string;
  role: string;
  scheduledFor: string; // ISO
  status: "Scheduled" | "In progress" | "Completed" | "Expired";
  score?: number; // 0-100 once completed
};

export type Submission = {
  id: string;
  candidate: string;
  role: string;
  client: string;
  submittedAt: string;
  stage:
    | "Submitted"
    | "Client review"
    | "Shortlisted"
    | "Interview"
    | "Offer"
    | "Rejected";
};

export type Offer = {
  id: string;
  candidate: string;
  role: string;
  client: string;
  amount: string;
  status: "Pending" | "Accepted" | "Declined" | "Joined";
  sentAt: string;
};

export type ActivityEvent = {
  id: string;
  kind: "submission" | "interview" | "offer" | "job" | "ai";
  message: string;
  when: string;
};

export const recruiter: RecruiterProfile = {
  name: "Aarav Mehta",
  initials: "AM",
  role: "Senior Technical Recruiter",
  team: "APAC Tech Hiring",
};

export const kpis: Kpi[] = [
  { id: "open", label: "Open jobs", value: 14, delta: 12, trend: "up", hint: "Currently active reqs" },
  { id: "active", label: "Active jobs", value: 9, delta: 4, trend: "up", hint: "With activity in 7 days" },
  { id: "assigned", label: "Assigned to me", value: 11, delta: -2, trend: "down" },
  { id: "interviews", label: "Interviews scheduled", value: 23, delta: 18, trend: "up", hint: "Next 14 days" },
  { id: "ai", label: "AI interviews", value: 17, delta: 32, trend: "up" },
  { id: "submissions", label: "Submissions", value: 48, delta: 9, trend: "up", hint: "This month" },
  { id: "offers", label: "Offers extended", value: 7, delta: 1, trend: "up" },
  { id: "joined", label: "Joined", value: 4, delta: 0, trend: "flat" },
];

export const supportingMetrics = {
  avgTimeToFillDays: 18,
  submissionToInterview: 42, // %
  interviewToOffer: 28, // %
  offerAcceptance: 71, // %
  responseTimeHours: 3.2,
};

export const jobs: Job[] = [
  { id: "J-1042", title: "Senior Java Developer", client: "Northwind Bank", location: "Bengaluru, IN", type: "Full-time", status: "Open", priority: "High", positions: 4, filled: 1, ageDays: 7, assignedTo: "me" },
  { id: "J-1039", title: "Product Designer", client: "Lumen Health", location: "Remote", type: "Full-time", status: "Open", priority: "Medium", positions: 1, filled: 0, ageDays: 12, assignedTo: "me" },
  { id: "J-1037", title: "DevOps Engineer", client: "Acme Cloud", location: "Pune, IN", type: "Contract", status: "Open", priority: "High", positions: 2, filled: 1, ageDays: 4, assignedTo: "me" },
  { id: "J-1031", title: "Engineering Manager", client: "Northwind Bank", location: "Mumbai, IN", type: "Full-time", status: "On hold", priority: "Low", positions: 1, filled: 0, ageDays: 22, assignedTo: "team" },
  { id: "J-1028", title: "Data Scientist", client: "Helios AI", location: "Hyderabad, IN", type: "Full-time", status: "Open", priority: "Medium", positions: 3, filled: 2, ageDays: 18, assignedTo: "me" },
];

export const interviews: Interview[] = [
  { id: "I-501", candidate: "Riya Kapoor", role: "Senior Java Developer", client: "Northwind Bank", when: "2026-04-23T10:30:00Z", round: "Tech R1", mode: "Virtual", status: "Scheduled" },
  { id: "I-502", candidate: "Karan Shah", role: "DevOps Engineer", client: "Acme Cloud", when: "2026-04-23T13:00:00Z", round: "Hiring Manager", mode: "Virtual", status: "In progress" },
  { id: "I-503", candidate: "Meera Iyer", role: "Product Designer", client: "Lumen Health", when: "2026-04-22T09:00:00Z", round: "Portfolio", mode: "Onsite", status: "Completed" },
  { id: "I-504", candidate: "Aditya Roy", role: "Data Scientist", client: "Helios AI", when: "2026-04-21T16:00:00Z", round: "Tech R2", mode: "Virtual", status: "No-show" },
  { id: "I-505", candidate: "Sana Khan", role: "Senior Java Developer", client: "Northwind Bank", when: "2026-04-24T11:00:00Z", round: "Tech R1", mode: "Virtual", status: "Rescheduled" },
];

export const aiInterviews: AiInterview[] = [
  { id: "A-201", candidate: "Vivek Nair", role: "Senior Java Developer", scheduledFor: "2026-04-23T08:00:00Z", status: "Completed", score: 86 },
  { id: "A-202", candidate: "Tanvi Joshi", role: "DevOps Engineer", scheduledFor: "2026-04-23T11:30:00Z", status: "In progress" },
  { id: "A-203", candidate: "Rohit Sen", role: "Data Scientist", scheduledFor: "2026-04-24T07:00:00Z", status: "Scheduled" },
  { id: "A-204", candidate: "Ishita Rao", role: "Product Designer", scheduledFor: "2026-04-22T15:00:00Z", status: "Completed", score: 72 },
  { id: "A-205", candidate: "Arjun Das", role: "Senior Java Developer", scheduledFor: "2026-04-20T09:00:00Z", status: "Expired" },
];

export const submissions: Submission[] = [
  { id: "S-901", candidate: "Riya Kapoor", role: "Senior Java Developer", client: "Northwind Bank", submittedAt: "2026-04-21", stage: "Interview" },
  { id: "S-902", candidate: "Karan Shah", role: "DevOps Engineer", client: "Acme Cloud", submittedAt: "2026-04-20", stage: "Shortlisted" },
  { id: "S-903", candidate: "Meera Iyer", role: "Product Designer", client: "Lumen Health", submittedAt: "2026-04-19", stage: "Offer" },
  { id: "S-904", candidate: "Aditya Roy", role: "Data Scientist", client: "Helios AI", submittedAt: "2026-04-18", stage: "Client review" },
  { id: "S-905", candidate: "Sana Khan", role: "Senior Java Developer", client: "Northwind Bank", submittedAt: "2026-04-17", stage: "Submitted" },
  { id: "S-906", candidate: "Vivek Nair", role: "Senior Java Developer", client: "Northwind Bank", submittedAt: "2026-04-16", stage: "Rejected" },
];

export const offers: Offer[] = [
  { id: "O-301", candidate: "Meera Iyer", role: "Product Designer", client: "Lumen Health", amount: "₹ 28 LPA", status: "Pending", sentAt: "2026-04-21" },
  { id: "O-302", candidate: "Pranav Bhatt", role: "DevOps Engineer", client: "Acme Cloud", amount: "₹ 34 LPA", status: "Accepted", sentAt: "2026-04-18" },
  { id: "O-303", candidate: "Neha Verma", role: "Data Scientist", client: "Helios AI", amount: "₹ 31 LPA", status: "Joined", sentAt: "2026-04-12" },
  { id: "O-304", candidate: "Yash Patel", role: "Senior Java Developer", client: "Northwind Bank", amount: "₹ 29 LPA", status: "Declined", sentAt: "2026-04-10" },
];

export const pipelineFunnel = [
  { stage: "Sourced", count: 312 },
  { stage: "Screened", count: 184 },
  { stage: "Submitted", count: 48 },
  { stage: "Interview", count: 23 },
  { stage: "Offer", count: 7 },
  { stage: "Joined", count: 4 },
];

export const submissionsTrend = [
  { day: "Mon", count: 6 },
  { day: "Tue", count: 9 },
  { day: "Wed", count: 7 },
  { day: "Thu", count: 12 },
  { day: "Fri", count: 8 },
  { day: "Sat", count: 3 },
  { day: "Sun", count: 3 },
];

export const topClients = [
  { name: "Northwind Bank", openJobs: 5, submissions: 18, offers: 3 },
  { name: "Acme Cloud", openJobs: 3, submissions: 12, offers: 2 },
  { name: "Lumen Health", openJobs: 2, submissions: 8, offers: 1 },
  { name: "Helios AI", openJobs: 4, submissions: 10, offers: 1 },
];

export const activity: ActivityEvent[] = [
  { id: "E1", kind: "offer", message: "Offer accepted by Pranav Bhatt for DevOps Engineer", when: "2h ago" },
  { id: "E2", kind: "interview", message: "Karan Shah is in interview for DevOps Engineer", when: "3h ago" },
  { id: "E3", kind: "ai", message: "AI interview completed by Vivek Nair · score 86", when: "5h ago" },
  { id: "E4", kind: "submission", message: "Submitted Sana Khan to Northwind Bank", when: "Yesterday" },
  { id: "E5", kind: "job", message: "New job created · Senior Java Developer at Northwind Bank", when: "2d ago" },
];
