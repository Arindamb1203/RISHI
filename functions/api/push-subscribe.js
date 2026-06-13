/* ═══════════════════════════════════════════
   RISHI Web Push — subscribe / unsubscribe / test
   POST { pw, action, subscription }
     action "subscribe"   → store subscription (admin pw required)
     action "unsubscribe" → remove subscription
     action "test"        → send a test push to all stored subs
   ═══════════════════════════════════════════ */
import { pushToAllAdmins } from './_push.js';

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

  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS rishi_push_subs (endpoint TEXT PRIMARY KEY, sub TEXT NOT NULL, created_at INTEGER NOT NULL)`
    ).run();

    const action = body.action || 'subscribe';

    if (action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint || !sub.keys) {
        return new Response(JSON.stringify({ error: 'subscription required' }), { status: 400, headers });
      }
      await env.DB.prepare(
        `INSERT INTO rishi_push_subs (endpoint, sub, created_at) VALUES (?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET sub = excluded.sub`
      ).bind(sub.endpoint, JSON.stringify(sub), Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (action === 'unsubscribe') {
      const ep = body.subscription && body.subscription.endpoint;
      if (ep) await env.DB.prepare(`DELETE FROM rishi_push_subs WHERE endpoint = ?`).bind(ep).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (action === 'test') {
      await pushToAllAdmins(env, {
        title: 'RISHI Monitor',
        body: 'Test notification — push is working.',
        url: '/monitor.html',
        tag: 'rishi-test'
      });
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed', detail: String(e) }), { status: 500, headers });
  }
}
