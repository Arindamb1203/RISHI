/* ═══════════════════════════════════════════
   RISHI Fix-Error — functions/api/fix-error.js
   Sends an error report to OpenAI and returns
   an AI diagnosis + fix suggestion.
   ═══════════════════════════════════════════ */

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  /* Auth check */
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token || (token !== "rishi2025" && token !== (env.ADMIN_PASS || "rishi2025"))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const { message, source, page, stack, studentId } = body;
  if (!message) return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers });

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 500, headers });
  }

  const prompt = `You are a debugging assistant for RISHI, an educational app for Indian school students (Classes 6-9, CBSE and ICSE boards).

An error was reported in the app:

Student: ${studentId || "unknown"}
Page: ${page || "unknown"}
Source: ${source || "unknown"}
Error: ${message}
${stack ? "Stack trace:\n" + stack : ""}

The app is built with:
- Pure HTML / CSS / Vanilla JS (no frameworks)
- Cloudflare Pages hosting
- Cloudflare D1 database
- Cloudflare KV for question banks
- OpenAI gpt-4.1-mini for AI features

Please:
1. Diagnose what likely caused this error (be specific, reference the page/source if possible)
2. Give a clear fix in 2-4 bullet points
3. Rate severity: LOW / MEDIUM / HIGH

Keep your response under 200 words. Format:
**Diagnosis:** ...
**Fix:**
• ...
• ...
**Severity:** ...`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const suggestion = data.choices?.[0]?.message?.content || "No response from AI.";
    return new Response(JSON.stringify({ ok: true, suggestion }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: "AI call failed: " + e.message }), { status: 500, headers });
  }
}
