import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  content: { heading?: string; paragraph: string }[];
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "autonomous-ai-recruiter-future",
    title: "The Rise of the Autonomous AI Recruiter: What It Means for Hiring",
    excerpt:
      "Explore how AI agents are transforming sourcing, screening, and engagement — and why the next generation of recruiters will be 10x more productive.",
    category: "AI & Automation",
    author: "Priya Sharma",
    authorRole: "Head of Product, Glohire",
    date: "Apr 12, 2026",
    readTime: "8 min read",
    image: blog1,
    tags: ["AI Recruiter", "Automation", "Future of Work"],
    content: [
      {
        paragraph:
          "Recruitment is undergoing its biggest shift in decades. The autonomous AI recruiter isn't a future concept — it's already sourcing, screening, and engaging candidates at scale across leading staffing agencies and enterprise teams.",
      },
      {
        heading: "From ATS to Autonomous Agent",
        paragraph:
          "Traditional ATS platforms were built to track candidates. Modern AI recruiters are built to act. They search talent pools, evaluate fit, write personalized outreach, schedule interviews, and even conduct first-round screens — all without human prompting.",
      },
      {
        heading: "Three Capabilities That Define an Autonomous Recruiter",
        paragraph:
          "1. Reasoning over candidate signals — not just keyword matching. 2. Multi-channel engagement across email, WhatsApp, SMS, and LinkedIn. 3. Closed-loop learning that improves quality of hire with every cycle.",
      },
      {
        heading: "What Recruiters Should Do Next",
        paragraph:
          "The recruiters thriving in this new era aren't competing with AI — they're orchestrating it. They focus on relationships, employer branding, and strategic hiring decisions while AI handles the volume work.",
      },
    ],
  },
  {
    slug: "multi-channel-candidate-engagement",
    title: "Why Multi-Channel Engagement Is the New Standard in Hiring",
    excerpt:
      "Email response rates are dropping. Discover how unified inboxes and WhatsApp-first outreach are driving 3x more candidate replies.",
    category: "Engagement",
    author: "Marcus Chen",
    authorRole: "Growth Lead, Glohire",
    date: "Apr 5, 2026",
    readTime: "6 min read",
    image: blog2,
    tags: ["Engagement", "WhatsApp", "Outreach"],
    content: [
      {
        paragraph:
          "Candidates today live across channels — and recruiters who only send emails are losing 70% of their potential pipeline before the conversation starts.",
      },
      {
        heading: "The Channel Shift",
        paragraph:
          "WhatsApp open rates exceed 90%. SMS averages 98%. LinkedIn InMails outperform cold email by 3x. Yet most ATS platforms still treat email as the only channel.",
      },
      {
        heading: "Unified Inbox: One Place for Every Conversation",
        paragraph:
          "A unified inbox lets recruiters reply across email, SMS, WhatsApp, and chat from a single thread. Context follows the candidate — no more switching tabs or losing history.",
      },
      {
        heading: "Personalization at Scale",
        paragraph:
          "AI-generated outreach tuned to role, location, and seniority outperforms generic templates by 4–6x. The winning formula: automation for volume, humans for nuance.",
      },
    ],
  },
  {
    slug: "ai-video-interviews-fairness",
    title: "AI Video Interviews: Fairness, Fraud Detection, and Real Signal",
    excerpt:
      "How modern AI interview systems remove bias, catch impersonation, and deliver consistent evaluation — at any scale.",
    category: "AI Interviews",
    author: "Dr. Aisha Okafor",
    authorRole: "Head of AI Research, Glohire",
    date: "Mar 28, 2026",
    readTime: "10 min read",
    image: blog3,
    tags: ["AI Interviews", "Fairness", "Proctoring"],
    content: [
      {
        paragraph:
          "AI interviews used to be a black box. Today, they're the most transparent and consistent way to evaluate candidates at volume — when designed correctly.",
      },
      {
        heading: "Removing the Bias of the Bad Day",
        paragraph:
          "Human interviewers vary by mood, time of day, and unconscious bias. AI interviewers apply the same rubric to every candidate, every time.",
      },
      {
        heading: "Fraud Detection That Actually Works",
        paragraph:
          "Live proctoring, voice biometrics, and behavioral signals catch impersonation, screen-sharing tools, and AI-assisted answers in real time.",
      },
      {
        heading: "Signal Over Surveillance",
        paragraph:
          "The goal isn't to monitor candidates — it's to give every candidate a fair, consistent shot. Glohire's interview engine surfaces strengths, not just risks.",
      },
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);
