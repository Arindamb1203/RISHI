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
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rishi_sys_resolved (
      sig TEXT PRIMARY KEY, resolved_at INTEGER NOT NULL
    )`).run();

    const cutoff7d = Date.now() - (7 * 24 * 60 * 60 * 1000); // last 7 days

    const [reportsRes, sessionsRes, sysErrRes, syncActRes, allAccsRes, resolvedRes] = await Promise.all([
      env.DB.prepare(
        `SELECT id, name, class, board, phone, page_url, page_name, report_type,
                description, status, submitted_at, ai_verdict, ai_status
         FROM rishi_error_reports ORDER BY submitted_at DESC LIMIT 150`
      ).all(),
      env.DB.prepare(
        `SELECT username, role, student_name, class, board, logged_at
         FROM rishi_sessions WHERE logged_at > ? ORDER BY logged_at DESC`
      ).bind(cutoff7d).all(),
      env.DB.prepare(
        `SELECT student_id, value, updated_at FROM rishi_sync
         WHERE key = 'rishi_error_log' ORDER BY updated_at DESC LIMIT 30`
      ).all(),
      /* last_key = most recently synced key per student, tells us what they were doing */
      env.DB.prepare(
        `SELECT s1.student_id, MAX(s1.updated_at) AS last_active,
                (SELECT key FROM rishi_sync WHERE student_id = s1.student_id
                 ORDER BY updated_at DESC LIMIT 1) AS last_key
         FROM rishi_sync s1 WHERE s1.updated_at > ?
         GROUP BY s1.student_id ORDER BY last_active DESC LIMIT 100`
      ).bind(cutoff7d).all(),
      env.DB.prepare(
        `SELECT username, data FROM rishi_accounts WHERE role = 'student'`
      ).all(),
      env.DB.prepare(`SELECT sig FROM rishi_sys_resolved`).all()
    ]);

    const resolvedSet = new Set((resolvedRes.results || []).map(r => r.sig));
    const sysSig = (e) => (e.studentId || '') + '|' + ((e.date || '') + (e.time || '')) + '|' + String(e.message || '').slice(0, 40);

    /* Build account lookup for enriching syncActivity */
    const accs = {};
    (allAccsRes.results || []).forEach(r => {
      try { accs[r.username] = JSON.parse(r.data); } catch(e) {}
    });

    /* Enrich syncActivity with name / class / board */
    const syncActivity = (syncActRes.results || []).map(s => {
      const acc = accs[s.student_id] || {};
      return {
        student_id: s.student_id,
        last_active: s.last_active,
        last_key: s.last_key || '',
        student_name: acc.studentName || acc.firstName || '',
        class: acc.class || '',
        board: acc.board || ''
      };
    });

    /* Process system errors */
    const systemErrors = [];
    (sysErrRes.results || []).forEach(r => {
      try {
        const entries = JSON.parse(r.value);
        if (Array.isArray(entries)) {
          entries.forEach(e => {
            const item = { ...e, studentId: e.studentId || r.student_id };
            item.sig = sysSig(item);
            item.status = resolvedSet.has(item.sig) ? 'fixed' : 'pending';
            systemErrors.push(item);
          });
        }
      } catch(e) {}
    });
    systemErrors.sort((a, b) => ((b.date||'')+(b.time||'')).localeCompare((a.date||'')+(a.time||'')));

    return new Response(JSON.stringify({
      ok: true,
      reports: reportsRes.results || [],
      sessions: sessionsRes.results || [],
      systemErrors: systemErrors.slice(0, 80),
      syncActivity,
      serverTime: new Date().toISOString()
    }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'Failed', detail: String(e) }), { status: 500, headers });
  }
}
