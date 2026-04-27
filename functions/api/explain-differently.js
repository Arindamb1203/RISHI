/**
 * RISHI — functions/api/explain-differently.js
 * Cloudflare Pages Function
 * POST /api/explain-differently
 *
 * Re-teaches a concept using a fresh approach (story, analogy, or visual steps)
 * when a student clicked "Explain Differently" on an explain page.
 *
 * Cloudflare env var required: GEMINI_API_KEY
 *
 * Request body (JSON):
 * {
 *   "concept":  "The concept or question text being explained",
 *   "chapter":  "Rational Numbers",          // from topbar
 *   "steps":    ["Step 1 text", "Step 2..."] // original steps already shown
 * }
 *
 * Response (JSON):
 * { "steps": ["Step 1: ...", "Step 2: ...", "Answer: ..."] }
 */

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL   = "https://generativelanguage.googleapis.com/v1/models/"
                   + GEMINI_MODEL + ":generateContent";

export async function onRequestPost(context) {
  const { request, env } = context;

  var apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);

  var body;
  try { body = await request.json(); }
  catch(e) { return jsonResponse({ error: "Invalid JSON body" }, 400); }

  var concept = (body.concept || "").trim();
  var chapter = (body.chapter || "Mathematics").trim();
  var steps   = Array.isArray(body.steps) ? body.steps : [];

  if (!concept) return jsonResponse({ error: "Missing: concept" }, 400);

  /* ── Build prompt ─────────────────────────────────────── */
  var stepsBlock = "";
  if (steps.length) {
    stepsBlock = "THE EXPLANATION THE STUDENT ALREADY SAW (but did not understand):\n";
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      stepsBlock += (i + 1) + ". " + (typeof s === "object" ? (s.t || s.text || "") : String(s)) + "\n";
    }
    stepsBlock += "\n";
  }

  var prompt =
    "You are a Class 8 CBSE Mathematics tutor.\n" +
    "A student just saw a step-by-step explanation but still did NOT understand it.\n" +
    "Re-explain using a COMPLETELY DIFFERENT approach than the original.\n\n" +
    "CHAPTER: " + chapter + "\n" +
    "CONCEPT: " + concept + "\n\n" +
    stepsBlock +
    "Choose the ONE approach that will work best for this specific concept:\n" +
    "  STORY    — Use a real-life Indian scenario (shop, kitchen, cricket, train journey)\n" +
    "  ANALOGY  — Compare the math idea to something a 13-year-old already knows well\n" +
    "  VISUAL   — Break into tiny concrete steps with a worked example using very simple numbers\n\n" +
    "Rules:\n" +
    "- Simple, warm language for a 13-year-old Indian student\n" +
    "- 3 to 5 steps maximum\n" +
    "- Each step MUST start with Step N: (e.g. Step 1:)\n" +
    "- End with one line starting with Answer: stating the key takeaway\n" +
    "- Do NOT repeat the original explanation — make it fresh and different\n" +
    "- No preamble, no greeting, no closing line\n" +
    "- Output ONLY the steps, nothing else";

  /* ── Call Gemini ──────────────────────────────────────── */
  var geminiRes;
  try {
    geminiRes = await fetch(GEMINI_URL + "?key=" + apiKey, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 700, temperature: 0.75 }
      })
    });
  } catch(err) {
    return jsonResponse({ error: "Failed to reach Gemini", detail: err.message }, 502);
  }

  if (!geminiRes.ok) {
    var errText = await geminiRes.text();
    return jsonResponse({ error: "Gemini API error", detail: errText }, 502);
  }

  var geminiData;
  try { geminiData = await geminiRes.json(); }
  catch(e) { return jsonResponse({ error: "Invalid Gemini response" }, 502); }

  var raw = "";
  try { raw = geminiData.candidates[0].content.parts[0].text.trim(); }
  catch(e) { return jsonResponse({ error: "Could not parse Gemini response" }, 502); }

  if (!raw) return jsonResponse({ error: "Empty Gemini response" }, 502);

  /* ── Parse into steps array ───────────────────────────── */
  var lines  = raw.split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
  var parsed = lines.filter(function(l){ return /^(Step\s*\d+:|Answer:)/i.test(l); });
  var result = parsed.length >= 2 ? parsed : lines;

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
