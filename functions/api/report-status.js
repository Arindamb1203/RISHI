export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!env.DB) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500, headers });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers });

  try {
    const row = await env.DB.prepare(
      `SELECT status FROM rishi_error_reports WHERE id = ?`
    ).bind(id).first();

    if (!row) return new Response(JSON.stringify({ status: 'pending' }), { headers });
    return new Response(JSON.stringify({ status: row.status }), { headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: 'DB read failed', detail: String(e) }), { status: 500, headers });
  }
}
