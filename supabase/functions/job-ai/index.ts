// Edge function: AI assistance for jobs
// - mode "summary": returns a tight 4-6 sentence summary of the JD
// - mode "questions": returns 8-12 screening questions tailored to skills + experience
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type Body = {
  mode: "summary" | "questions";
  title?: string;
  jd?: string;
  skills?: string[];
  experience?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const { mode } = body;
    if (mode !== "summary" && mode !== "questions") {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const title = (body.title || "").slice(0, 200);
    const jd = (body.jd || "").slice(0, 8000);
    const skills = (body.skills || []).slice(0, 30);
    const experience = (body.experience || "").slice(0, 100);

    let payload: any;

    if (mode === "summary") {
      payload = {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You write concise, recruiter-friendly job summaries. Output 4-6 sentences, plain prose, no markdown headers, no bullet points. Highlight the role purpose, must-have skills, seniority and key responsibility.",
          },
          {
            role: "user",
            content: `Job title: ${title}\n\nJob description:\n${jd || "(no JD provided — write based on title)"}`,
          },
        ],
      };
    } else {
      payload = {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You generate sharp, role-specific screening questions a recruiter can ask in a phone screen. Mix technical depth questions with behavioral ones. Calibrate difficulty to the experience level provided.",
          },
          {
            role: "user",
            content: `Generate 10 screening questions for:\nRole: ${title}\nExperience level: ${experience || "Mid"}\nKey skills: ${skills.length ? skills.join(", ") : "(infer from JD)"}\n\nJD context:\n${jd || "(none)"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_questions",
              description: "Return the screening questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["technical", "behavioral", "experience", "culture"] },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        question: { type: "string" },
                      },
                      required: ["category", "difficulty", "question"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_questions" } },
      };
    }

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const choice = data.choices?.[0];

    if (mode === "summary") {
      const summary = choice?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ summary }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // questions mode — parse tool call
    const toolCall = choice?.message?.tool_calls?.[0];
    let questions: any[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      } catch (e) {
        console.error("tool args parse error", e);
      }
    }
    return new Response(JSON.stringify({ questions }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-ai error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
