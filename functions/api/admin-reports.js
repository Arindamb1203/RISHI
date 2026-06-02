export async function onRequest(context) {
  const { env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!env.DB) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500, headers });

  try {
    /* Ensure table exists via prepare().run() — exec() can fail silently on D1 */
    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rishi_error_reports (
        id TEXT PRIMARY KEY,
        name TEXT, class TEXT, board TEXT, phone TEXT,
        page_url TEXT, page_name TEXT, report_type TEXT,
        description TEXT, screenshot TEXT,
        status TEXT DEFAULT 'pending', submitted_at TEXT
      )`).run();
    } catch(e) {
      /* Table already exists — continue */
    }

    /* Add report_type column if missing (migration for existing tables) */
    try {
      await env.DB.prepare(`ALTER TABLE rishi_error_reports ADD COLUMN report_type TEXT`).run();
    } catch(e) { /* Column already exists */ }
    try {
      await env.DB.prepare(`ALTER TABLE rishi_error_reports ADD COLUMN ai_verdict TEXT`).run();
    } catch(e) { /* Column already exists */ }
    try {
      await env.DB.prepare(`ALTER TABLE rishi_error_reports ADD COLUMN ai_status TEXT`).run();
    } catch(e) { /* Column already exists */ }

    const result = await env.DB.prepare(
      `SELECT id, name, class, board, phone, page_url, page_name, report_type,
              description, screenshot, status, submitted_at, ai_verdict, ai_status
       FROM rishi_error_reports ORDER BY submitted_at DESC`
    ).all();

    if (!result.success) {
      return new Response(JSON.stringify({ error: 'DB read failed', detail: result.error || 'unknown' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ ok: true, reports: result.results || [] }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), { status: 500, headers });
  }
}
