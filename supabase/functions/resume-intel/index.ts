// Edge function: Resume Intelligence — parse a resume + AI compare with prior versions
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type PriorVersion = {
  version: number;
  parsed: any;
  summary?: string | null;
};

const SYSTEM = `You are a resume intelligence engine. You receive the raw text of a candidate's
newest resume and (optionally) previously parsed prior versions. You must:
1) Parse the new resume into structured JSON.
2) Generate a concise summary of the candidate today.
3) Detect changes vs the IMMEDIATELY previous version (latest_changes).
4) Detect overall career evolution vs ALL prior versions (evolution_summary).

Use semantic comparison — wording/order changes do not count as changes. Categorise each change as
"added" | "removed" | "modified". Be specific (skill names, company names, etc.).

5) Build a CAREER TRAJECTORY analysis from the work history:
   - For every job: compute tenure in months from start/end (treat "Present"/blank end as today: ${new Date().toISOString().slice(0,10)}).
   - Classify each role into a primary "domain" (e.g., "Java Backend", "Frontend React", "Data Engineering",
     "AI/ML Engineering", "DevOps", "QA", "Product Management", "Mobile iOS", etc.) and list its tech_focus.
   - Detect domain transitions across consecutive jobs (e.g., Java Backend -> AI/ML Engineering). For each
     transition record from_domain, to_domain, at_company, date, and tenure_in_new_role_months.
   - Identify the current role and its tenure_months.
   - Compute a stability_score 0-100 based on average tenure and frequency of role-hopping.
   - Generate fitment_flags: short, recruiter-facing observations such as
     "Recently switched from Java Backend to AI Engineering — only 3 months in the new role,
      may not be ideal for a senior AI Engineer requirement". Severity: "info" | "warning" | "critical".
     Always include at least one flag if there is a domain transition in the last 12 months with <12 months tenure.`;

const TOOL = {
  type: "function",
  function: {
    name: "emit_resume_intel",
    description: "Return parsed resume + AI comparison output.",
    parameters: {
      type: "object",
      properties: {
        parsed: {
          type: "object",
          properties: {
            full_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            headline: { type: "string" },
            total_experience_years: { type: "number" },
            skills: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  title: { type: "string" },
                  start: { type: "string" },
                  end: { type: "string" },
                  location: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } },
                },
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  tech: { type: "array", items: { type: "string" } },
                },
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  institution: { type: "string" },
                  degree: { type: "string" },
                  year: { type: "string" },
                },
              },
            },
            certifications: { type: "array", items: { type: "string" } },
          },
          required: ["skills", "experience"],
        },
        summary: { type: "string", description: "One-paragraph snapshot of the candidate today." },
        latest_changes: {
          type: "object",
          properties: {
            headline: { type: "string", description: "1-2 sentence summary of latest changes." },
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: [
                      "skill", "experience", "company", "designation", "promotion",
                      "responsibility", "project", "education", "certification",
                      "timeline", "location", "contact",
                    ],
                  },
                  type: { type: "string", enum: ["added", "removed", "modified"] },
                  detail: { type: "string" },
                },
                required: ["category", "type", "detail"],
              },
            },
          },
          required: ["headline", "changes"],
        },
        evolution_summary: {
          type: "object",
          properties: {
            headline: { type: "string" },
            experience_growth: { type: "string" },
            career_growth: { type: "string" },
            technology_evolution: { type: "string" },
            company_progression: { type: "string" },
            leadership_growth: { type: "string" },
            career_trajectory: {
              type: "object",
              properties: {
                timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      title: { type: "string" },
                      start: { type: "string" },
                      end: { type: "string" },
                      duration_months: { type: "number" },
                      domain: { type: "string" },
                      tech_focus: { type: "array", items: { type: "string" } },
                      is_transition: { type: "boolean" },
                      transition_note: { type: "string" },
                    },
                    required: ["company", "title", "duration_months", "domain"],
                  },
                },
                domain_shifts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      from_domain: { type: "string" },
                      to_domain: { type: "string" },
                      at_company: { type: "string" },
                      date: { type: "string" },
                      tenure_in_new_role_months: { type: "number" },
                      note: { type: "string" },
                    },
                    required: ["from_domain", "to_domain", "tenure_in_new_role_months"],
                  },
                },
                current_role: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    domain: { type: "string" },
                    tenure_months: { type: "number" },
                    started: { type: "string" },
                  },
                },
                stability_score: { type: "number" },
                fitment_flags: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["info", "warning", "critical"] },
                      message: { type: "string" },
                    },
                    required: ["severity", "message"],
                  },
                },
              },
            },
          },
          required: ["headline"],
        },
      },
      required: ["parsed", "summary", "latest_changes", "evolution_summary"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { raw_text, prior } = await req.json() as { raw_text: string; prior: PriorVersion[] };
    if (!raw_text || typeof raw_text !== "string") {
      return new Response(JSON.stringify({ error: "raw_text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sortedPrior = (prior || []).slice().sort((a, b) => a.version - b.version);
    const userMsg = JSON.stringify({
      new_resume_text: raw_text.slice(0, 30000),
      prior_versions: sortedPrior.map((p) => ({
        version: p.version,
        summary: p.summary || null,
        parsed: p.parsed,
      })),
      instructions: sortedPrior.length === 0
        ? "No prior versions exist. Set latest_changes.changes = [] and evolution_summary fields to indicate first version."
        : `Compare against version ${sortedPrior[sortedPrior.length - 1].version} for latest_changes, and against all ${sortedPrior.length} prior versions for evolution_summary.`,
    });

    const resp = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_resume_intel" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "No tool call returned", raw: data }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let parsed;
    try { parsed = JSON.parse(args); } catch {
      return new Response(JSON.stringify({ error: "Bad JSON from model" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resume-intel error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
