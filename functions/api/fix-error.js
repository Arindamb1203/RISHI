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

  const prompt = `You are helping the owner of RISHI, an educational app. The owner is not a programmer. A technical error was recorded in the app.

Student affected: ${studentId || "unknown"}
Page where it happened: ${page || "unknown"}
Error code: ${message}
${stack ? "Technical detail:\n" + stack.slice(0, 600) : ""}

Write a plain English explanation that a non-technical parent or business owner can understand. No programming words. Keep it to 3 short points:

What happened: (one sentence — what the student experienced)
Why it happened: (one sentence — simple cause, no code terms)
What to do: (one sentence — what the app owner should check or fix)

Severity: Low / Medium / High (one word only at the end)`;

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
