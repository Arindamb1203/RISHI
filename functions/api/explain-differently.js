/**
 * RISHI — functions/api/explain-differently.js
 * Cloudflare Pages Function
 * POST /api/explain-differently
 *
 * Re-teaches a concept using a fresh approach (story, analogy, or visual steps)
 * when a student clicked "I Don't Understand" on an explain page.
 *
 * Cloudflare env var required: OPENAI_API_KEY
 *
 * Request body (JSON):
 * {
 *   "concept":  "The concept or question text being explained",
 *   "chapter":  "Rational Numbers",
 *   "steps":    ["Step 1 text", "Step 2..."]
 * }
 *
 * Response (JSON):
 * { "steps": ["Step 1: ...", "Step 2: ...", "Answer: ..."] }
 */

const OPENAI_URL   = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1-mini";

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);

  let body;
  try { body = await request.json(); }
  catch (e) { return jsonResponse({ error: "Invalid JSON body" }, 400); }

  const concept = (body.concept || "").trim();
  const chapter = (body.chapter || "Mathematics").trim();
  const steps   = Array.isArray(body.steps) ? body.steps : [];

  if (!concept) return jsonResponse({ error: "Missing: concept" }, 400);

  /* Keep only last 2 steps to reduce tokens */
  const recentSteps = steps.slice(-2).map(s =>
    typeof s === "object" ? (s.t || s.text || "") : String(s)
  ).join(" | ");

  const userPrompt =
    `CBSE Class 8 Maths. Student didn't understand: ${concept} (Chapter: ${chapter}).\n` +
    (recentSteps ? `Already tried: ${recentSteps}\n` : "") +
    `Re-explain using a story OR analogy OR simple worked example — completely different from above.\n` +
    `Rules: 3-4 steps only. Each starts with Step N:. Last line starts with Answer:. Simple English. Output steps only.`;

  /* Call OpenAI */
  let openaiRes;
  try {
    openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      OPENAI_MODEL,
        max_tokens: 250,
        temperature: 0.75,
        messages: [
          {
            role:    "system",
            content: "You are Rishika, a friendly CBSE Class 8 Maths tutor. You explain concepts in simple, creative ways using stories and analogies. Always follow the exact output format requested."
          },
          {
            role:    "user",
            content: userPrompt
          }
        ]
      })
    });
  } catch (err) {
    return jsonResponse({ error: "Failed to reach OpenAI", detail: err.message }, 502);
  }

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    return jsonResponse({ error: "OpenAI API error", detail: errText }, 502);
  }

  let openaiData;
  try { openaiData = await openaiRes.json(); }
  catch (e) { return jsonResponse({ error: "Invalid OpenAI response" }, 502); }

  let raw = "";
  try { raw = openaiData.choices[0].message.content.trim(); }
  catch (e) { return jsonResponse({ error: "Could not parse OpenAI response" }, 502); }

  if (!raw) return jsonResponse({ error: "Empty OpenAI response" }, 502);

  /* Parse into steps array */
  const lines  = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed = lines.filter(l => /^(Step\s*\d+:|Answer:)/i.test(l));
  const result = parsed.length >= 2 ? parsed : lines;

  return jsonResponse({ steps: result }, 200);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }
  });
}
