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
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const ADMIN_PW = env.ADMIN_PASSWORD || 'rishi2025';
  if (body.pw !== ADMIN_PW) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rishi_sessions (
      id TEXT PRIMARY KEY, username TEXT NOT NULL, role TEXT NOT NULL,
      student_name TEXT, class TEXT, board TEXT, logged_at INTEGER NOT NULL
    )`).run();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const [reportsRes, sessionsRes, sysErrRes, syncActRes] = await Promise.all([
      env.DB.prepare(
        `SELECT id, name, class, board, phone, page_url, page_name, report_type,
                description, status, submitted_at, ai_verdict, ai_status
         FROM rishi_error_reports ORDER BY submitted_at DESC LIMIT 150`
      ).all(),
      env.DB.prepare(
        `SELECT username, role, student_name, class, board, logged_at
         FROM rishi_sessions WHERE logged_at > ? ORDER BY logged_at DESC`
      ).bind(todayTs).all(),
      env.DB.prepare(
        `SELECT student_id, value, updated_at FROM rishi_sync
         WHERE key = 'rishi_error_log' ORDER BY updated_at DESC LIMIT 30`
      ).all(),
      env.DB.prepare(
        `SELECT student_id, MAX(updated_at) as last_active
         FROM rishi_sync WHERE updated_at > ?
         GROUP BY student_id ORDER BY last_active DESC LIMIT 100`
      ).bind(todayTs).all()
    ]);

    const systemErrors = [];
    (sysErrRes.results || []).forEach(r => {
      try {
        const entries = JSON.parse(r.value);
        if (Array.isArray(entries)) {
          entries.forEach(e => systemErrors.push({ ...e, studentId: e.studentId || r.student_id }));
        }
      } catch(e) {}
    });
    systemErrors.sort((a, b) => ((b.date||'')+(b.time||'')).localeCompare((a.date||'')+(a.time||'')));

    return new Response(JSON.stringify({
      ok: true,
      reports: reportsRes.results || [],
      sessions: sessionsRes.results || [],
      systemErrors: systemErrors.slice(0, 80),
      syncActivity: syncActRes.results || [],
      serverTime: new Date().toISOString()
    }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'Failed', detail: String(e) }), { status: 500, headers });
  }
}
