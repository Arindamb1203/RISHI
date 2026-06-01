export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST')    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
  if (!env.DB)                      return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500, headers });
  if (!env.OPENAI_API_KEY)          return new Response(JSON.stringify({ error: 'OpenAI not configured' }), { status: 500, headers });

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { studentId, message, context: ctx } = body;
  if (!message || !message.trim())
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400, headers });

  const sid   = (studentId || 'anonymous').toLowerCase().trim();
  const today = new Date().toISOString().slice(0, 10);
  const LIMIT = 20;

  /* Ensure table exists */
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rishi_chat_usage (
      student_id TEXT NOT NULL, date TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (student_id, date)
    )`).run();
  } catch(e) {}

  /* Check daily limit */
  let used = 0;
  try {
    const row = await env.DB.prepare(
      'SELECT count FROM rishi_chat_usage WHERE student_id = ? AND date = ?'
    ).bind(sid, today).first();
    used = row ? row.count : 0;
  } catch(e) {}

  if (used >= LIMIT) {
    return new Response(JSON.stringify({
      error: 'daily_limit',
      reply: 'You have used all 20 chat messages for today. I\'ll be back tomorrow! Keep practising. 😊',
      remaining: 0
    }), { status: 429, headers });
  }

  /* Build context strings */
  const chapter  = ctx?.chapter  || 'this chapter';
  const topic    = ctx?.topic    || 'Mathematics';
  const cls      = ctx?.class    || '8';
  const board    = ctx?.board    || 'CBSE';
  const question = ctx?.question || '';
  const opts     = Array.isArray(ctx?.options) ? ctx.options : [];
  const optsText = opts.length
    ? '\nOptions: ' + opts.map((o, i) => String.fromCharCode(65 + i) + ') ' + o).join(' | ')
    : '';

  const systemPrompt =
`You are Rishika, a warm and encouraging Class ${cls} ${board} maths tutor.
The student is currently taking an exam on: ${chapter} (Topic: ${topic}).
${question ? `Current question: "${question}"${optsText}` : ''}

RULES:
1. NEVER reveal or confirm the answer to the current question. If asked directly, gently refuse and explain the underlying concept instead.
2. DO explain the concept, method, or theory behind this type of problem — using a DIFFERENT example.
3. DO answer related theory, general knowledge, or curiosity questions.
4. Keep responses SHORT — 2-3 sentences maximum, or 3 bullet points. No walls of text.
5. Be friendly, use simple language suited for Class ${cls}.
6. If the question is completely off-topic or inappropriate, politely redirect.`;

  /* Call OpenAI */
  let reply;
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message.trim().slice(0, 400) }],
        max_tokens: 180,
        temperature: 0.7
      })
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', detail: t.slice(0, 200) }), { status: 500, headers });
    }
    const data = await resp.json();
    reply = data.choices?.[0]?.message?.content || '';
  } catch(e) {
    return new Response(JSON.stringify({ error: 'AI request failed', detail: String(e) }), { status: 500, headers });
  }

  if (!reply)
    return new Response(JSON.stringify({ error: 'No response from AI' }), { status: 500, headers });

  /* Increment usage */
  try {
    await env.DB.prepare(
      `INSERT INTO rishi_chat_usage (student_id, date, count) VALUES (?, ?, 1)
       ON CONFLICT(student_id, date) DO UPDATE SET count = count + 1`
    ).bind(sid, today).run();
  } catch(e) {}

  return new Response(JSON.stringify({ reply, remaining: LIMIT - used - 1 }), { headers });
}
