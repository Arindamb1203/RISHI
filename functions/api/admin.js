/**
 * RISHI — functions/api/admin.js
 * Cloudflare Pages Function
 * POST /api/admin
 *
 * Actions:
 *   seed   — load a chapter's JSON file from repo into KV (one-time or annual)
 *   seed_all — seed all 16 chapters at once
 *   delete — remove a KV key
 *   list   — list all KV keys
 *
 * Auth: Bearer token in Authorization header
 *       Token stored as env var RISHI_ADMIN_TOKEN (set in Cloudflare dashboard)
 *
 * KV Binding name: RISHI_QUESTIONS
 *
 * Request body (JSON):
 * {
 *   "action": "seed" | "seed_all" | "delete" | "list",
 *   "board":  "cbse",
 *   "class":  "8",
 *   "ch":     "01",        // for seed / delete
 *   "type":   "exam"       // "exam" or "practice"
 * }
 */

// All 16 active chapter IDs for seed_all
const ALL_CHAPTERS = [
  "01","02","03","04","05",
  "08","09","10","11a","11b",
  "12","13","14","15","16","17"
];

// Maps chId → actual folder in repo (JSONs grouped by topic, not one folder per chapter)
const FOLDER_MAP = {
  "01": "ch01", "08": "ch01", "12": "ch01", "13": "ch01",
  "02": "ch02", "09": "ch02", "14": "ch02",
  "03": "ch03", "04": "ch03", "10": "ch03",
  "05": "ch05",
  "11a": "ch11", "11b": "ch11",
  "15": "ch15",
  "16": "ch16",
  "17": "ch17",
};

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── Auth check ──────────────────────────────────────────
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  const validToken = env.RISHI_ADMIN_TOKEN;

  if (!validToken || token !== validToken) {
    return jsonResponse({ error: "Unauthorised" }, 401);
  }

  // ── Parse body ──────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { action, board = "cbse", class: cls = "8", ch, type = "exam" } = body;

  if (!env.RISHI_QUESTIONS) {
    return jsonResponse({ error: "KV binding RISHI_QUESTIONS not configured" }, 500);
  }

  // ── Route actions ────────────────────────────────────────
  switch (action) {

    case "seed": {
      if (!ch) return jsonResponse({ error: "Missing param: ch" }, 400);
      const result = await seedChapter(env, request, board, cls, ch, type);
      return jsonResponse(result, result.error ? 500 : 200);
    }

    case "seed_all": {
      const results = [];
      for (const chId of ALL_CHAPTERS) {
        const r = await seedChapter(env, request, board, cls, chId, "exam");
        results.push({ ch: chId, ...r });
      }
      const failed = results.filter(r => r.error);
      return jsonResponse({
        message: `Seeded ${results.length - failed.length}/${results.length} chapters`,
        results,
        failed_count: failed.length
      }, 200);
    }

    case "delete": {
      if (!ch) return jsonResponse({ error: "Missing param: ch" }, 400);
      const chId = normaliseChId(ch);
      const kvKey = `${board}_${cls}_ch${chId}_${type}`;
      await env.RISHI_QUESTIONS.delete(kvKey);
      return jsonResponse({ message: `Deleted key: ${kvKey}` }, 200);
    }

    case "list": {
      const list = await env.RISHI_QUESTIONS.list();
      return jsonResponse({ keys: list.keys.map(k => k.name) }, 200);
    }

    default:
      return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// ── Helpers ────────────────────────────────────────────────

async function seedChapter(env, request, board, cls, ch, type) {
  const chId   = normaliseChId(ch);
  const kvKey  = `${board}_${cls}_ch${chId}_${type}`;
  const fname  = type === "exam" ? `ch${chId}-exam.json` : `ch${chId}-practice.json`;
  const folder = FOLDER_MAP[chId] || `ch${chId}`;
  const path   = `/data/${board}/class${cls}/${folder}/${fname}`;
  const fileUrl = new URL(path, request.url);

  try {
    const res = await fetch(fileUrl.toString());
    if (!res.ok) {
      return { error: `File not found: ${path}` };
    }
    const text = await res.text();

    // Validate it is real JSON
    JSON.parse(text);

    await env.RISHI_QUESTIONS.put(kvKey, text);
    return { message: `Seeded ${kvKey} (${text.length} bytes)` };

  } catch (err) {
    return { error: `Failed to seed ${kvKey}: ${err.message}` };
  }
}

function normaliseChId(ch) {
  // "1" → "01", "ch01" → "01", "11a" → "11a" (kept as-is for mensuration parts)
  const stripped = ch.replace(/^ch/i, "");
  // If it ends in a letter (like "11a"), don't pad it
  if (/[a-z]$/i.test(stripped)) return stripped;
  return stripped.padStart(2, "0");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
