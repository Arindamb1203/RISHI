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

  const { id } = body;
  if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers });

  try {
    await env.DB.prepare(
      `UPDATE rishi_error_reports SET status = 'fixed' WHERE id = ?`
    ).bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'DB update failed', detail: String(e) }), { status: 500, headers });
  }
}
