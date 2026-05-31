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

  const { name, class: cls, board, phone, pageURL, pageName, description, reportType } = body;
  let { screenshot } = body;

  if (!description) return new Response(JSON.stringify({ error: 'description required' }), { status: 400, headers });

  /* Truncate screenshot to stay well under D1 1MB column limit */
  if (screenshot && screenshot.length > 700000) {
    screenshot = screenshot.slice(0, 700000);
  }

  /* Force table creation via prepare().run() — exec() can fail silently on D1 */
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

  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  try {
    const result = await env.DB.prepare(
      `INSERT INTO rishi_error_reports
        (id, name, class, board, phone, page_url, page_name, report_type, description, screenshot, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).bind(
      id,
      name || '',
      cls || '',
      board || '',
      phone || '',
      pageURL || '',
      pageName || '',
      reportType || 'Others',
      description,
      screenshot || '',
      submittedAt
    ).run();

    if (!result.success) {
      return new Response(JSON.stringify({ error: 'DB insert failed', detail: result.error || 'unknown' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true, reportId: id }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'DB write failed', detail: String(e) }), { status: 500, headers });
  }
}
