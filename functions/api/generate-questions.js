/**
 * RISHI — functions/api/generate-questions.js
 * Cloudflare Pages Function
 * POST /api/generate-questions
 *
 * Generates high-quality MCQ questions for a given chapter/class using OpenAI,
 * then stores them in Cloudflare KV (RISHI_QUESTIONS binding).
 *
 * Env vars required:
 *   OPENAI_API_KEY      — OpenAI secret key
 *   RISHI_ADMIN_TOKEN   — Admin auth token
 *
 * KV Binding: RISHI_QUESTIONS
 *
 * KV key format: {board}_{class}_ch{chId}_{tag}
 *   e.g. cbse_8_ch01_chapter_exam
 *        cbse_7_ch02_practice
 *
 * Request body (JSON):
 * {
 *   "board":       "cbse",
 *   "class":       "8",
 *   "chId":        "01",
 *   "chapterName": "Rational Numbers",
 *   "tag":         "chapter_exam",   // chapter_exam | practice | topic_exam | sampurna | explain
 *   "count":       15,               // optional, default 15
 *   "mode":        "append"          // "append" (default) | "replace"
 * }
 *
 * Response (JSON):
 * {
 *   "ok": true,
 *   "generated": 15,
 *   "total_in_bank": 30,
 *   "kvKey": "cbse_8_ch01_chapter_exam",
 *   "questions": [...]
 * }
 *
 * Question schema:
 * {
 *   "id":           "C8_CH01_001",
 *   "q":            "Question text",
 *   "options":      ["Option A", "Option B", "Option C", "Option D"],
 *   "correct":      0,           // 0-indexed: 0=A 1=B 2=C 3=D
 *   "explanation":  "Why this is correct",
 *   "source":       "NCT",       // NCT RDS RSA EXM CBP OLY ORI
 *   "tag":          "chapter_exam",
 *   "exam_exclusive": false,
 *   "difficulty":   "medium",    // easy | medium | hard
 *   "verified":     false,
 *   "times_served": 0,
 *   "times_correct": 0,
 *   "times_wrong":  0,
 *   "rested":       false,
 *   "year_last_used": null
 * }
 */

const OPENAI_URL   = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1-mini";

const VALID_TAGS = ["chapter_exam", "practice", "topic_exam", "sampurna", "explain"];

// Source codes by tag — helps prompt OpenAI to pick the right style
const TAG_SOURCE_HINT = {
  chapter_exam: "NCERT exercises, NCERT Exemplar, RD Sharma, RS Aggarwal",
  practice:     "NCERT exercises, RD Sharma solved examples",
  topic_exam:   "NCERT Exemplar, RD Sharma, CBSE previous year papers",
  sampurna:     "NCERT Exemplar, Olympiad (IMO/NTSE style), CBSE previous year papers",
  explain:      "NCERT exercises (straightforward, concept-checking)"
};

// Difficulty mix by tag
const TAG_DIFFICULTY = {
  chapter_exam: "mix: 4 easy, 7 medium, 4 hard",
  practice:     "mix: 5 easy, 7 medium, 3 hard",
  topic_exam:   "mix: 3 easy, 7 medium, 5 hard",
  sampurna:     "mix: 2 easy, 8 medium, 5 hard",
  explain:      "easy to medium only"
};

export async function onRequestPost(context) {
  const { request, env } = context;

  /* ── Auth ── */
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!env.RISHI_ADMIN_TOKEN || token !== env.RISHI_ADMIN_TOKEN) {
    return jsonResponse({ error: "Unauthorised" }, 401);
  }

  if (!env.OPENAI_API_KEY) return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
  if (!env.RISHI_QUESTIONS) return jsonResponse({ error: "KV binding RISHI_QUESTIONS not configured" }, 500);

  /* ── Parse body ── */
  let body;
  try { body = await request.json(); }
  catch (e) { return jsonResponse({ error: "Invalid JSON body" }, 400); }

  const board       = (body.board       || "cbse").toLowerCase();
  const cls         = (body.class       || "8").toString();
  const chId        = normaliseChId(body.chId || "01");
  const chapterName = (body.chapterName || "").trim();
  const tag         = (body.tag         || "chapter_exam").toLowerCase();
  const count       = Math.min(Math.max(parseInt(body.count) || 15, 5), 20);
  const mode        = body.mode === "replace" ? "replace" : "append";

  if (!chapterName) return jsonResponse({ error: "Missing: chapterName" }, 400);
  if (!VALID_TAGS.includes(tag)) return jsonResponse({ error: `Invalid tag. Use: ${VALID_TAGS.join(", ")}` }, 400);

  const kvKey = `${board}_${cls}_ch${chId}_${tag}`;

  /* ── Load existing bank (for append mode + ID sequencing) ── */
  let existingQuestions = [];
  try {
    const existing = await env.RISHI_QUESTIONS.get(kvKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      existingQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    }
  } catch (_) { /* empty or corrupt — start fresh */ }

  const startIdx = existingQuestions.length + 1;

  /* ── Build prompt ── */
  const idPrefix   = `C${cls}_CH${chId.toUpperCase()}`;
  const examExcl   = ["topic_exam", "sampurna"].includes(tag);
  const sourceHint = TAG_SOURCE_HINT[tag] || TAG_SOURCE_HINT.chapter_exam;
  const diffHint   = TAG_DIFFICULTY[tag]  || TAG_DIFFICULTY.chapter_exam;

  const systemPrompt =
    `You are an expert CBSE Mathematics question setter for Class ${cls}. ` +
    `You write questions at the standard of NCERT Exemplar, RD Sharma, and Olympiad competitions. ` +
    `You NEVER write trivial formula-substitution questions. ` +
    `Every question must require thinking — multi-step, application-based, or concept-trapping. ` +
    `You always respond with ONLY a valid JSON array. No markdown, no explanation, no preamble.`;

  const userPrompt =
    `Generate exactly ${count} MCQ questions for:
Class: ${cls} CBSE Mathematics
Chapter: ${chapterName}
Purpose: ${tag.replace(/_/g, " ")}
Source style: ${sourceHint}
Difficulty: ${diffHint}

Rules:
- 4 options each (A/B/C/D style content, no labels in the option text itself)
- "correct" is 0-indexed (0=first option, 1=second, etc.)
- Distractors must be plausible — common student mistakes, not random
- "explanation" must explain WHY the answer is correct in 1-2 sentences
- "source" must be one of: NCT (NCERT), RDS (RD Sharma), RSA (RS Aggarwal), EXM (NCERT Exemplar), CBP (CBSE Previous Year), OLY (Olympiad/NTSE), ORI (Original)
- "difficulty" must be: easy | medium | hard
- IDs must start from ${idPrefix}_${String(startIdx).padStart(3, "0")}
- No duplicate questions
- All maths must be correct — double-check every answer

Return ONLY this JSON array, nothing else:
[
  {
    "id": "${idPrefix}_${String(startIdx).padStart(3, "0")}",
    "q": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct": 0,
    "explanation": "Explanation here",
    "source": "NCT",
    "tag": "${tag}",
    "exam_exclusive": ${examExcl},
    "difficulty": "medium",
    "verified": false,
    "times_served": 0,
    "times_correct": 0,
    "times_wrong": 0,
    "rested": false,
    "year_last_used": null
  }
]`;

  /* ── Call OpenAI ── */
  let openaiRes;
  try {
    openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:       OPENAI_MODEL,
        max_tokens:  4000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   }
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

  /* ── Parse JSON from response ── */
  // Strip markdown code fences if OpenAI added them despite instructions
  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  let newQuestions;
  try {
    newQuestions = JSON.parse(raw);
    if (!Array.isArray(newQuestions)) throw new Error("Not an array");
  } catch (e) {
    return jsonResponse({ error: "OpenAI returned invalid JSON", raw: raw.slice(0, 500) }, 502);
  }

  /* ── Validate + sanitise each question ── */
  newQuestions = newQuestions
    .filter(q => q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4)
    .map((q, i) => ({
      id:           q.id || `${idPrefix}_${String(startIdx + i).padStart(3, "0")}`,
      q:            String(q.q).trim(),
      options:      q.options.map(o => String(o).trim()),
      correct:      typeof q.correct === "number" ? Math.min(Math.max(q.correct, 0), 3) : 0,
      explanation:  String(q.explanation || "").trim(),
      source:       ["NCT","RDS","RSA","EXM","CBP","OLY","ORI"].includes(q.source) ? q.source : "NCT",
      tag:          tag,
      exam_exclusive: examExcl,
      difficulty:   ["easy","medium","hard"].includes(q.difficulty) ? q.difficulty : "medium",
      verified:     false,
      times_served:  0,
      times_correct: 0,
      times_wrong:   0,
      rested:        false,
      year_last_used: null
    }));

  if (!newQuestions.length) {
    return jsonResponse({ error: "No valid questions generated. Try again." }, 502);
  }

  /* ── Merge with existing (append) or replace ── */
  const finalQuestions = mode === "replace"
    ? newQuestions
    : [...existingQuestions, ...newQuestions];

  /* ── Write to KV ── */
  const bankPayload = {
    meta: {
      board,
      class:        cls,
      chId,
      chapterName,
      tag,
      total:        finalQuestions.length,
      last_updated: new Date().toISOString(),
    },
    questions: finalQuestions
  };

  try {
    await env.RISHI_QUESTIONS.put(kvKey, JSON.stringify(bankPayload));
  } catch (err) {
    return jsonResponse({ error: "KV write failed", detail: err.message }, 500);
  }

  return jsonResponse({
    ok:             true,
    generated:      newQuestions.length,
    total_in_bank:  finalQuestions.length,
    kvKey,
    mode,
    questions:      newQuestions
  }, 200);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}

/* ── Helpers ── */
function normaliseChId(ch) {
  const stripped = String(ch).replace(/^ch/i, "");
  if (/[a-z]$/i.test(stripped)) return stripped;
  return stripped.padStart(2, "0");
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
