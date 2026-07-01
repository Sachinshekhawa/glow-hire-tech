// Live FX rate proxy using Frankfurter (ECB rates, free, no key required).
// Requires a signed-in user; returns { rate, from, to, date, source }.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPPORTED = new Set([
  "USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD", "AED", "JPY", "CHF", "MXN", "BRL", "ZAR",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const from = (url.searchParams.get("from") || "USD").toUpperCase();
    const to = (url.searchParams.get("to") || "INR").toUpperCase();

    if (!SUPPORTED.has(from) || !SUPPORTED.has(to)) {
      return new Response(JSON.stringify({ error: "Unsupported currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (from === to) {
      return new Response(
        JSON.stringify({ rate: 1, from, to, date: new Date().toISOString().slice(0, 10), source: "identity" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const upstream = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    const r = await fetch(upstream);
    if (!r.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${r.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const j = await r.json();
    const rate = j?.rates?.[to];
    if (typeof rate !== "number") {
      return new Response(JSON.stringify({ error: "No rate returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ rate, from, to, date: j.date, source: "frankfurter" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
