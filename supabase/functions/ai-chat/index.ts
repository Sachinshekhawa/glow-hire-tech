// Edge function: streaming AI chatbot for the Glohire assistant
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const DEFAULT_SYSTEM_PROMPT = `You are Glohire AI, the in-app assistant for a recruiting platform called Glohire.
You help recruiters with: writing job descriptions, drafting outreach to candidates, screening question ideas,
interview prep, summarising resumes, explaining product features (Jobs, Candidates, Submissions, Interviews,
AI Interviews, Offers, Dashboards), and general hiring advice.
Be concise, friendly, and use markdown when helpful (lists, bold, code blocks). Never invent data about the
user's specific jobs or candidates — if asked, tell them to open the relevant page.`;

// Server-side allowlist of agent personas. Clients pass an agentId — they
// cannot inject arbitrary system prompts.
const AGENT_PROMPTS: Record<string, string> = {
  recruiter: `You are the Recruiter Agent inside Glohire, an AI recruiting platform.
Specialise in: job summaries, AI-generated job descriptions, copy for job board postings
(LinkedIn, Naukri, Indeed, Dice, etc.), and personalised outreach / follow-up email content.
Always ask for missing essentials (role, location, experience, must-have skills, comp band) if the user is vague.
Output in clean markdown with headings, bullets and ready-to-paste email blocks. Keep tone warm and professional.`,
  candidate: `You are the Candidate Agent inside Glohire.
Specialise in: candidate-to-JD relevancy analysis, candidate profile summaries, explaining
pipeline & submission status semantics, and generating personalised screening questions & answers.
When given a JD + resume text, produce a relevancy score (0-100), strengths, gaps and recommended next steps.
Always answer in clean markdown.`,
  resume: `You are the Resume Intelligence Agent inside Glohire.
Specialise in: resume version comparison (N versions), highlighted change summaries
(Added/Modified/Removed), career trajectory analysis, domain shifts, tenure & stability scoring,
and hiring fitment recommendations. Reference colour coding: green=added, yellow=modified, red=removed.
Always answer in clean markdown with crisp bullets.`,
  marketplace: `You are the Marketplace Agent inside Glohire.
Specialise in: estimated bill rate ranges and salary bands by job title, years of experience, and location
(US metros, India metros, EU, remote). Always present a low / median / high range with currency,
unit (per hour C2C, per year, etc.), and list the assumptions you used. State that figures are
indicative market estimates, not guarantees, and recommend cross-checking with a live data source.`,
  zoom: `You are the Zoom Calling Agent inside Glohire.
Specialise in: summarising call recordings / transcripts, extracting main discussion points and
action items, running sentiment analysis (positive / neutral / negative with rationale), and
scoring call behaviour & engagement (tone, pace, interruptions, clarity).
When the user pastes a transcript, output: Summary, Key Points, Action Items, Sentiment, Behaviour Signals.`,
};

const jsonResp = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- AuthN: require a valid Supabase user JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResp({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return jsonResp({ error: "Unauthorized" }, 401);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return jsonResp({ error: "LOVABLE_API_KEY missing" }, 500);

    const { messages, agentId } = await req.json();
    if (!Array.isArray(messages)) {
      return jsonResp({ error: "messages array required" }, 400);
    }

    const system =
      typeof agentId === "string" && Object.prototype.hasOwnProperty.call(AGENT_PROMPTS, agentId)
        ? AGENT_PROMPTS[agentId]
        : DEFAULT_SYSTEM_PROMPT;

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages.slice(-20)],
      }),
    });

    if (aiResp.status === 429) return jsonResp({ error: "Rate limit reached. Please try again shortly." }, 429);
    if (aiResp.status === 402) return jsonResp({ error: "AI credits exhausted. Add credits in Workspace settings." }, 402);
    if (!aiResp.ok || !aiResp.body) {
      const t = await aiResp.text().catch(() => "");
      console.error("AI gateway error", aiResp.status, t);
      return jsonResp({ error: "AI request failed" }, 500);
    }

    return new Response(aiResp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("ai-chat error", e);
    return jsonResp({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
