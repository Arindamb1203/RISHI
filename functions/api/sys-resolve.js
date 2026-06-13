/* ═══════════════════════════════════════════
   RISHI Monitor — resolve / unresolve SYSTEM (JS) errors
   System errors live inside per-student rishi_error_log arrays (no status of
   their own), so "fixed" state is stored server-side here by error signature.
   POST { pw, action, sigs:[...] }
     action "fix"   → mark signatures resolved (default)
     action "unfix" → mark signatures pending again
   ═══════════════════════════════════════════ */
export async function onRequest(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
  if (!env.DB) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500, headers });

  let body;
  try { body = await request.json(); } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const ADMIN_PW = env.ADMIN_PASSWORD || 'rishi2025';
  if (body.pw !== ADMIN_PW) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  const sigs = Array.isArray(body.sigs) ? body.sigs.filter(Boolean) : [];
  if (!sigs.length) return new Response(JSON.stringify({ error: 'sigs required' }), { status: 400, headers });

  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS rishi_sys_resolved (sig TEXT PRIMARY KEY, resolved_at INTEGER NOT NULL)`
    ).run();

    const action = body.action || 'fix';
    if (action === 'unfix') {
      const stmts = sigs.map(s => env.DB.prepare(`DELETE FROM rishi_sys_resolved WHERE sig = ?`).bind(s));
      await env.DB.batch(stmts);
    } else {
      const now = Date.now();
      const stmts = sigs.map(s => env.DB.prepare(
        `INSERT INTO rishi_sys_resolved (sig, resolved_at) VALUES (?, ?)
         ON CONFLICT(sig) DO UPDATE SET resolved_at = excluded.resolved_at`
      ).bind(s, now));
      await env.DB.batch(stmts);
    }
    return new Response(JSON.stringify({ ok: true, count: sigs.length }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed', detail: String(e) }), { status: 500, headers });
  }
}
