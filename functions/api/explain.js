/**
 * RISHI — functions/api/explain.js
 * Cloudflare Pages Function
 * POST /api/explain
 *
 * Generates step-by-step explanation for a wrong exam answer.
 * Uses Google Gemini Flash (free tier — 1500 req/day, no credit card).
 *
 * Cloudflare env var required: GEMINI_API_KEY
 *
 * Request body (JSON):
 * {
 *   "question":       "The question text",
 *   "correct_answer": "c" | "24" | "1/6",
 *   "options":        { "a":"...", "b":"...", "c":"...", "d":"..." },  // MCQ only
 *   "student_answer": "b"   // optional
 * }
 *
 * Response (JSON):
 * { "steps": ["Step 1: ...", "Step 2: ...", "Answer: ..."] }
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL   = "https://generativelanguage.googleapis.com/v1beta/models/"
                   + GEMINI_MODEL + ":generateContent";

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  var body;
  try { body = await request.json(); }
  catch(e) { return jsonResponse({ error: "Invalid JSON body" }, 400); }

  var question       = body.question;
  var correct_answer = body.correct_answer;
  var options        = body.options;
  var student_answer = body.student_answer;

  if (!question || correct_answer === undefined) {
    return jsonResponse({ error: "Missing required fields: question, correct_answer" }, 400);
  }

  /* ── Build prompt ─────────────────────────────────────── */
  var prompt = "You are a Class 8 CBSE Mathematics tutor.\n\n";
  prompt += "QUESTION:\n" + question + "\n\n";

  if (options && typeof options === "object") {
    prompt += "OPTIONS:\n";
    var keys = Object.keys(options);
    for (var i = 0; i < keys.length; i++) {
      prompt += "  " + keys[i] + ") " + options[keys[i]] + "\n";
    }
    prompt += "\n";
    var correctLabel = options[correct_answer] !== undefined
      ? correct_answer + ") " + options[correct_answer]
      : String(correct_answer);
    prompt += "CORRECT ANSWER: " + correctLabel + "\n";
    if (student_answer && options[student_answer] !== undefined) {
      prompt += "STUDENT ANSWERED: " + student_answer + ") " + options[student_answer] + "\n";
    }
  } else {
    prompt += "CORRECT ANSWER: " + String(correct_answer) + "\n";
    if (student_answer) prompt += "STUDENT ANSWERED: " + String(student_answer) + "\n";
  }

  prompt += "\nExplain step by step how to solve this and reach the correct answer.\n"
          + "Rules:\n"
          + "- Simple language for a 13-year-old Indian student\n"
          + "- 3 to 5 steps maximum\n"
          + "- Each step must start with Step N: (e.g. Step 1:)\n"
          + "- End with a line starting with Answer: stating the correct answer\n"
          + "- No preamble, no greeting, no closing sentence\n"
          + "- Output ONLY the steps, nothing else";

  /* ── Call Gemini API ──────────────────────────────────── */
  var geminiRes;
  try {
    geminiRes = await fetch(GEMINI_URL + "?key=" + apiKey, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.2 }
      })
    });
  } catch(err) {
    return jsonResponse({ error: "Failed to reach Gemini API", detail: err.message }, 502);
  }

  if (!geminiRes.ok) {
    var errText = await geminiRes.text();
    return jsonResponse({ error: "Gemini API error", detail: errText }, 502);
  }

  var geminiData;
  try { geminiData = await geminiRes.json(); }
  catch(e) { return jsonResponse({ error: "Invalid response from Gemini API" }, 502); }

  var raw = "";
  try {
    raw = geminiData.candidates[0].content.parts[0].text.trim();
  } catch(e) {
    return jsonResponse({ error: "Could not parse Gemini response" }, 502);
  }

  if (!raw) return jsonResponse({ error: "Empty response from Gemini" }, 502);

  /* ── Parse into steps array ───────────────────────────── */
  var lines  = raw.split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
  var steps  = lines.filter(function(l){ return /^(Step\s*\d+:|Answer:)/i.test(l); });
  var result = steps.length >= 2 ? steps : lines;

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
