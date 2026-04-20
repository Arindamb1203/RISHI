/**
 * RISHI — functions/api/questions.js
 * Cloudflare Pages Function
 * GET /api/questions?board=cbse&class=8&ch=01&type=exam
 *
 * KV Binding name in Cloudflare dashboard: RISHI_QUESTIONS
 * Key pattern: {board}_{class}_ch{id}_{type}
 * e.g. cbse_8_ch01_exam, cbse_8_ch01_practice
 *
 * Falls back to static JSON file if KV key not found.
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const board = url.searchParams.get("board") || "cbse";
  const cls   = url.searchParams.get("class") || "8";
  const ch    = url.searchParams.get("ch");
  const type  = url.searchParams.get("type") || "exam";

  // Validate required params
  if (!ch) {
    return new Response(
      JSON.stringify({ error: "Missing required param: ch" }),
      { status: 400, headers: corsHeaders("application/json") }
    );
  }

  // Normalise chapter id — accept "1" or "01" or "ch01"
  const chId = ch.replace(/^ch/i, "").padStart(2, "0");
  const kvKey = `${board}_${cls}_ch${chId}_${type}`;

  try {
    // 1. Try KV first (live database)
    if (env.RISHI_QUESTIONS) {
      const kvData = await env.RISHI_QUESTIONS.get(kvKey);
      if (kvData) {
        return new Response(kvData, {
          status: 200,
          headers: corsHeaders("application/json"),
        });
      }
    }

    // 2. Fall back to static JSON file in repo
    const staticPath = `/data/${board}/class${cls}/ch${chId}/${type === "exam" ? `ch${chId}-exam` : `ch${chId}-practice`}.json`;
    const staticUrl  = new URL(staticPath, request.url);
    const staticRes  = await fetch(staticUrl.toString());

    if (staticRes.ok) {
      const text = await staticRes.text();
      return new Response(text, {
        status: 200,
        headers: corsHeaders("application/json"),
      });
    }

    return new Response(
      JSON.stringify({ error: `Questions not found for key: ${kvKey}` }),
      { status: 404, headers: corsHeaders("application/json") }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: err.message }),
      { status: 500, headers: corsHeaders("application/json") }
    );
  }
}

function corsHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  };
}
