export async function onRequestPost(context) {
  const HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/1ab15965-e25b-4d76-9f2d-1693fb1abdd5';
  try {
    const res = await fetch(HOOK, { method: 'POST' });
    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
