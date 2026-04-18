/* ═══════════════════════════════════════════
   RISHI D1 SYNC WORKER — functions/d1-sync.js
   Handles both progress sync and account sync.
   Requires D1 binding named "DB".
   ═══════════════════════════════════════════ */

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 not configured. Add DB binding named 'DB'." }), { status: 500, headers });
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const { action } = body;

  /* ── ENSURE TABLES EXIST ── */
  try {
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_sync (student_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (student_id, key))");
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_accounts (username TEXT PRIMARY KEY, role TEXT NOT NULL, mobile TEXT NOT NULL, data TEXT NOT NULL, pw_override TEXT, updated_at INTEGER NOT NULL)");
  } catch(e) {
    return new Response(JSON.stringify({ error: "Table init failed", detail: String(e) }), { status: 500, headers });
  }

  /* ════════════════════════════════
     PROGRESS SYNC — set / get
  ════════════════════════════════ */

  if (action === "set") {
    const { studentId, key, value } = body;
    if (!studentId || !key || value === undefined) {
      return new Response(JSON.stringify({ error: "studentId, key, value required" }), { status: 400, headers });
    }
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_sync (student_id, key, value, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(student_id, key)
         DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(studentId.trim().toLowerCase(), key, String(value), Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB write failed", detail: String(e) }), { status: 500, headers });
    }
  }

  if (action === "get") {
    const { studentId } = body;
    if (!studentId) return new Response(JSON.stringify({ error: "studentId required" }), { status: 400, headers });
    try {
      const result = await env.DB.prepare(
        `SELECT key, value, updated_at FROM rishi_sync WHERE student_id = ? ORDER BY updated_at DESC`
      ).bind(studentId.trim().toLowerCase()).all();
      return new Response(JSON.stringify({ ok: true, data: result.results || [] }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB read failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* ════════════════════════════════
     ACCOUNT SYNC
  ════════════════════════════════ */

  /* Register — saves both student and parent rows */
  if (action === "register") {
    const { data } = body;
    if (!data || !data.studentUsername || !data.parentUsername || !data.primaryMobile) {
      return new Response(JSON.stringify({ error: "data with studentUsername, parentUsername, primaryMobile required" }), { status: 400, headers });
    }
    const now = Date.now();
    const json = JSON.stringify(data);
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_accounts (username, role, mobile, data, updated_at)
         VALUES (?, 'student', ?, ?, ?)
         ON CONFLICT(username)
         DO UPDATE SET data = excluded.data, mobile = excluded.mobile, updated_at = excluded.updated_at`
      ).bind(data.studentUsername.toLowerCase(), data.primaryMobile, json, now).run();

      await env.DB.prepare(
        `INSERT INTO rishi_accounts (username, role, mobile, data, updated_at)
         VALUES (?, 'parent', ?, ?, ?)
         ON CONFLICT(username)
         DO UPDATE SET data = excluded.data, mobile = excluded.mobile, updated_at = excluded.updated_at`
      ).bind(data.parentUsername.toLowerCase(), data.primaryMobile, json, now).run();

      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Register failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Find account by username */
  if (action === "find-account") {
    const { username } = body;
    if (!username) return new Response(JSON.stringify({ error: "username required" }), { status: 400, headers });
    try {
      const row = await env.DB.prepare(
        `SELECT * FROM rishi_accounts WHERE username = ?`
      ).bind(username.trim().toLowerCase()).first();
      if (!row) return new Response(JSON.stringify({ ok: true, found: false }), { headers });
      return new Response(JSON.stringify({
        ok: true, found: true,
        role: row.role,
        pw_override: row.pw_override || null,
        data: JSON.parse(row.data)
      }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Query failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Find account by mobile — for forgot credentials */
  if (action === "find-by-mobile") {
    const { mobile } = body;
    if (!mobile) return new Response(JSON.stringify({ error: "mobile required" }), { status: 400, headers });
    try {
      const row = await env.DB.prepare(
        `SELECT * FROM rishi_accounts WHERE mobile = ? AND role = 'student'`
      ).bind(mobile.trim()).first();
      if (!row) return new Response(JSON.stringify({ ok: true, found: false }), { headers });
      const d = JSON.parse(row.data);
      const pRow = await env.DB.prepare(
        `SELECT pw_override FROM rishi_accounts WHERE username = ?`
      ).bind(d.parentUsername.toLowerCase()).first();
      return new Response(JSON.stringify({
        ok: true, found: true,
        studentUsername: d.studentUsername,
        parentUsername: d.parentUsername,
        studentPwOverride: row.pw_override || null,
        parentPwOverride: (pRow && pRow.pw_override) || null
      }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Query failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Save password override */
  if (action === "save-pw") {
    const { username, pw } = body;
    if (!username || !pw) return new Response(JSON.stringify({ error: "username and pw required" }), { status: 400, headers });
    try {
      await env.DB.prepare(
        `UPDATE rishi_accounts SET pw_override = ?, updated_at = ? WHERE username = ?`
      ).bind(pw, Date.now(), username.trim().toLowerCase()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "PW save failed", detail: String(e) }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Unknown action: " + action }), { status: 400, headers });
}
