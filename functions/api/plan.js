/* ═══════════════════════════════════════════
   RISHI — AI Study Planner
   functions/api/plan.js
   POST /api/plan
   Body: { chapters[], examDate, examType, studentClass }
   Returns: { ok, plan: [{chapterName, startDate, targetDate, studyDays, tip}] }
   ═══════════════════════════════════════════ */

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST')   return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { chapters, examDate, examType, studentClass } = body;

  if (!chapters || !chapters.length) {
    return new Response(JSON.stringify({ error: 'chapters array required' }), { status: 400, headers });
  }

  const today      = new Date().toISOString().slice(0, 10);
  const cls        = studentClass || 8;
  const type       = examType || 'General';
  const dateClause = examDate
    ? `The exam is on ${examDate}. Work backwards from that date so all chapters are covered before it.`
    : `No exam date is set. Assign approximately 7 days per chapter starting from tomorrow.`;

  const prompt = `You are a CBSE Class ${cls} Maths study planner.
Today: ${today}
Exam type: ${type}
${dateClause}

Chapters to schedule (in order):
${chapters.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Create a realistic day-by-day study plan. Distribute chapters proportionally. Start from tomorrow (${today} + 1 day).

Reply ONLY with a valid JSON array. Each object must have exactly these fields:
- "chapterName": string (exact chapter name from the list above)
- "startDate": "YYYY-MM-DD"
- "targetDate": "YYYY-MM-DD"  
- "studyDays": number
- "tip": one short actionable study tip (max 10 words)

No markdown, no explanation text, no code fences. Just the raw JSON array.`;

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), { status: 500, headers });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model:       'gpt-4.1-mini',
        max_tokens:  1200,
        temperature: 0.2,
        messages: [
          {
            role:    'system',
            content: 'You are a precise CBSE study scheduler. You only reply with valid JSON arrays. No markdown, no extra text.'
          },
          {
            role:    'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return new Response(JSON.stringify({ error: 'OpenAI no response', detail: JSON.stringify(data) }), { status: 500, headers });
    }

    const raw   = data.choices[0].message.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();

    let plan;
    try {
      plan = JSON.parse(clean);
    } catch(pe) {
      /* Return fallback structure */
      return new Response(JSON.stringify({ ok: false, error: 'Parse failed', raw: clean }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ ok: true, plan }), { headers });

  } catch(e) {
    return new Response(JSON.stringify({ error: 'AI request failed', detail: String(e) }), { status: 500, headers });
  }
}
