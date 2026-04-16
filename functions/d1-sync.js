/* ═══════════════════════════════════════════
   RISHI D1 SYNC WORKER — functions/d1-sync.js
   Cloudflare Pages Function. Requires D1
   database binding named "DB" (see setup).
   ═══════════════════════════════════════════ */

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: "D1 not configured. Add DB binding named 'DB' in Cloudflare Pages → Settings → Functions → D1 bindings." }),
      { status: 500, headers }
    );
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const { action, studentId, key, value } = body;

  if (!studentId || !studentId.trim() || studentId.trim() === "default") {
    return new Response(
      JSON.stringify({ error: "Valid studentId required. Set student name in dashboard first." }),
      { status: 400, headers }
    );
  }

  const sid = studentId.trim().toLowerCase();

  /* Ensure table exists — runs fast after first time (D1 caches schema) */
  await env.DB.exec(
    `CREATE TABLE IF NOT EXISTS rishi_sync (
      student_id TEXT NOT NULL,
      key        TEXT NOT NULL,
      value      TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (student_id, key)
    )`
  );

  /* ── SET ── */
  if (action === "set") {
    if (!key || value === undefined || value === null) {
      return new Response(JSON.stringify({ error: "key and value required" }), { status: 400, headers });
    }
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_sync (student_id, key, value, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(student_id, key)
         DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(sid, key, String(value), Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB write failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* ── GET ── */
  if (action === "get") {
    try {
      const result = await env.DB.prepare(
        `SELECT key, value, updated_at FROM rishi_sync WHERE student_id = ? ORDER BY updated_at DESC`
      ).bind(sid).all();
      return new Response(JSON.stringify({ ok: true, data: result.results || [] }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB read failed", detail: String(e) }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Unknown action: " + action }), { status: 400, headers });
}
