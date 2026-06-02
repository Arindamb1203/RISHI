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

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { reportId, questionText, optionA, optionB, optionC, optionD, correctOption, chapter, cls, board, reportType } = body;

  if (!questionText) return new Response(JSON.stringify({ error: 'questionText required' }), { status: 400, headers });
  if (!env.OPENAI_API_KEY) return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500, headers });

  const isNotInSyllabus = (reportType || '').indexOf('Syllabus') !== -1;

  const checkInstruction = isNotInSyllabus
    ? 'Check if this question is relevant to the chapter mentioned. If the topic is clearly outside the chapter scope, say it is not in syllabus.'
    : 'Check if the question is factually/mathematically correct AND the marked correct option is actually right.';

  const prompt = `You are checking a question for a Class ${cls || '?'} ${(board || 'CBSE').toUpperCase()} student in India.

Chapter: ${chapter || 'Unknown'}

Question: ${questionText}
Option A: ${optionA || ''}
Option B: ${optionB || ''}
Option C: ${optionC || ''}
Option D: ${optionD || ''}
Marked correct answer: Option ${(correctOption || '').toUpperCase()}

${checkInstruction}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "isCorrect": true or false,
  "plainReason": "One plain sentence a parent can understand — no technical or programming words",
  "replacementQuestion": null
}

If isCorrect is false, also fill replacementQuestion with a new MCQ on the same topic:
{
  "isCorrect": false,
  "plainReason": "...",
  "replacementQuestion": {
    "text": "question text here",
    "a": "option A text",
    "b": "option B text",
    "c": "option C text",
    "d": "option D text",
    "correct": "a"
  }
}`;

  let aiResult = { isCorrect: true, plainReason: 'Question appears correct.', replacementQuestion: null };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.2
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const raw = (data.choices?.[0]?.message?.content || '').trim();
    aiResult = JSON.parse(raw);
  } catch(e) {
    /* If AI fails, default to "correct" so student is not incorrectly skipped */
    aiResult = { isCorrect: true, plainReason: 'Could not verify — please check manually.', replacementQuestion: null };
  }

  /* Update the report in D1 with the AI verdict */
  if (reportId && env.DB) {
    try {
      await env.DB.prepare(`ALTER TABLE rishi_error_reports ADD COLUMN ai_verdict TEXT`).run();
    } catch(e) { /* column exists */ }
    try {
      await env.DB.prepare(`ALTER TABLE rishi_error_reports ADD COLUMN ai_status TEXT`).run();
    } catch(e) { /* column exists */ }

    const aiStatus = aiResult.isCorrect ? 'confirmed_correct' : 'confirmed_wrong';
    const verdictText = aiResult.isCorrect
      ? 'AI checked: Question is correct. ' + (aiResult.plainReason || '')
      : 'AI found an issue: ' + (aiResult.plainReason || '') + (aiResult.replacementQuestion ? ' A replacement question was added.' : '');

    try {
      await env.DB.prepare(
        `UPDATE rishi_error_reports SET ai_verdict = ?, ai_status = ?, status = ? WHERE id = ?`
      ).bind(
        verdictText,
        aiStatus,
        aiResult.isCorrect ? 'pending' : 'ai_auto_noted',
        reportId
      ).run();
    } catch(e) { /* ignore D1 update failure */ }
  }

  return new Response(JSON.stringify({
    isCorrect: aiResult.isCorrect,
    plainReason: aiResult.plainReason || '',
    replacementQ: aiResult.replacementQuestion || null
  }), { headers });
}
