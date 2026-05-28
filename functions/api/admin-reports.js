export async function onRequest(context) {
  const { env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!env.DB) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500, headers });

  try {
    await env.DB.exec(`CREATE TABLE IF NOT EXISTS rishi_error_reports (
      id TEXT PRIMARY KEY,
      name TEXT, class TEXT, board TEXT, phone TEXT,
      page_url TEXT, page_name TEXT, description TEXT, screenshot TEXT,
      status TEXT DEFAULT 'pending', submitted_at TEXT
    )`);

    const result = await env.DB.prepare(
      `SELECT id, name, class, board, phone, page_url, page_name, description, screenshot, status, submitted_at
       FROM rishi_error_reports ORDER BY submitted_at DESC`
    ).all();

    return new Response(JSON.stringify({ ok: true, reports: result.results || [] }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), { status: 500, headers });
  }
}
