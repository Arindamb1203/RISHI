/**
 * RISHI — functions/api/explain.js
 * Cloudflare Pages Function
 * POST /api/explain
 *
 * Proxies to Claude API (claude-haiku-4-5) to generate
 * step-by-step explanation for a wrong exam answer.
 * Keeps API key hidden server-side.
 *
 * Cloudflare env var required: ANTHROPIC_API_KEY
 *
 * Request body (JSON):
 * {
 *   "question": "The question text",
 *   "correct_answer": "c" | "24" | "1/6",   // whatever the correct answer is
 *   "options": { "a":"...", "b":"...", ... }, // optional — only for MCQ
 *   "student_answer": "b"                    // what the student picked (optional)
 * }
 *
 * Response (JSON):
 * {
 *   "steps": ["Step 1: ...", "Step 2: ...", "Answer: ..."]
 * }
 */

const MODEL    = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 600;
const API_URL  = "https://api.anthropic.com/v1/messages";

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── CORS preflight passthrough ───────────────────────────
  if (request.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  // ── Auth: API key must be set ────────────────────────────
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  // ── Parse request body ───────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { question, correct_answer, options, student_answer } = body;

  if (!question || correct_answer === undefined) {
    return jsonResponse({ error: "Missing required fields: question, correct_answer" }, 400);
  }

  // ── Build prompt ─────────────────────────────────────────
  let prompt = `You are a Class 8 CBSE Mathematics tutor helping a student understand why they got a question wrong.\n\n`;
  prompt += `QUESTION:\n${question}\n\n`;

  if (options && typeof options === "object") {
    prompt += `OPTIONS:\n`;
    for (const [key, val] of Object.entries(options)) {
      prompt += `  ${key}) ${val}\n`;
    }
    prompt += `\n`;
    const correctLabel = options[correct_answer] !== undefined
      ? `${correct_answer}) ${options[correct_answer]}`
      : correct_answer;
    prompt += `CORRECT ANSWER: ${correctLabel}\n`;
    if (student_answer && options[student_answer] !== undefined) {
      prompt += `STUDENT ANSWERED: ${student_answer}) ${options[student_answer]}\n`;
    }
  } else {
    prompt += `CORRECT ANSWER: ${correct_answer}\n`;
    if (student_answer) {
      prompt += `STUDENT ANSWERED: ${student_answer}\n`;
    }
  }

  prompt += `\nExplain step by step how to solve this problem and arrive at the correct answer.
Rules:
- Use simple language suitable for a 13-year-old Indian student
- Give 3 to 5 clear steps maximum
- Each step must start with "Step N:" (e.g. "Step 1:")
- End with a final line starting with "Answer:" stating the correct answer clearly
- Do NOT include any preamble, greeting, or closing sentence
- Respond ONLY with the steps, nothing else`;

  // ── Call Claude API ──────────────────────────────────────
  let claudeRes;
  try {
    claudeRes = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });
  } catch (err) {
    return jsonResponse({ error: "Failed to reach Claude API", detail: err.message }, 502);
  }

  if (!claudeRes.ok) {
    const errText = await claudeRes.text();
    return jsonResponse({ error: "Claude API error", detail: errText }, 502);
  }

  let claudeData;
  try {
    claudeData = await claudeRes.json();
  } catch {
    return jsonResponse({ error: "Invalid response from Claude API" }, 502);
  }

  // ── Parse response into steps array ─────────────────────
  const raw = (claudeData.content?.[0]?.text || "").trim();
  if (!raw) {
    return jsonResponse({ error: "Empty response from Claude API" }, 502);
  }

  // Split on lines that start with "Step N:" or "Answer:"
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const steps = lines.filter(l => /^(Step\s*\d+:|Answer:)/i.test(l));

  // Fallback: if parsing fails, return all lines as steps
  const result = steps.length >= 2 ? steps : lines;

  return jsonResponse({ steps: result }, 200);
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}

// ── Helpers ───────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }
  });
}

function corsPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
