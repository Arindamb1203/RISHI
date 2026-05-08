/**
 * RISHI — functions/api/questions.js
 * Cloudflare Pages Function
 * GET /api/questions?board=cbse&class=8&ch=01&type=exam
 * GET /api/questions?board=cbse&class=9&ch=01&type=exam
 *
 * KV Binding name in Cloudflare dashboard: RISHI_QUESTIONS
 * Key pattern: {board}_{class}_ch{id}_{type}
 * e.g. cbse_8_ch01_exam, cbse_9_ch01_exam
 *
 * Falls back to static JSON file if KV key not found.
 *
 * Class 8 — JSON files grouped by topic folder:
 *   ch01/ → ch01, ch08, ch12, ch13  (Arithmetic)
 *   ch02/ → ch02, ch09, ch14        (Algebra)
 *   ch03/ → ch03, ch04, ch10        (Geometry)
 *   ch05/ → ch05                    (Data Handling)
 *   ch11/ → ch11a, ch11b            (Mensuration)
 *   ch15/ → ch15                    (Intro to Graphs)
 *   ch16/ → ch16                    (Playing with Numbers)
 *
 * Class 9 — one chapter per folder (1:1 mapping):
 *   ch01/ → ch01  (Real Numbers)
 *   ch02/ → ch02  (Polynomials)
 *   ch03/ → ch03  (Linear Equations in Two Variables)
 *   ch04/ → ch04  (Coordinate Geometry)
 *   ch05/ → ch05  (Euclid's Geometry)
 *   ch06/ → ch06  (Lines and Angles)
 *   ch07/ → ch07  (Triangles)
 *   ch08/ → ch08  (Quadrilaterals)
 *   ch09/ → ch09  (Circles)
 *   ch10/ → ch10  (Heron's Formula)
 *   ch11/ → ch11  (Surface Areas and Volumes)
 *   ch12/ → ch12  (Statistics)
 */

// Class-aware folder maps: FOLDER_MAP[class][chId] → folder name
const FOLDER_MAP = {
  "8": {
    "01":  "ch01",
    "08":  "ch01",
    "12":  "ch01",
    "13":  "ch01",
    "02":  "ch02",
    "09":  "ch02",
    "14":  "ch02",
    "03":  "ch03",
    "04":  "ch03",
    "10":  "ch03",
    "05":  "ch05",
    "11a": "ch11",
    "11b": "ch11",
    "15":  "ch15",
    "16":  "ch16",
    "17":  "ch17",
  },
  "9": {
    "01": "ch01",
    "02": "ch02",
    "03": "ch03",
    "04": "ch04",
    "05": "ch05",
    "06": "ch06",
    "07": "ch07",
    "08": "ch08",
    "09": "ch09",
    "10": "ch10",
    "11": "ch11",
    "12": "ch12",
  },
  "7": {
    "01": "ch01",
    "02": "ch02",
    "03": "ch03",
    "04": "ch04",
    "05": "ch05",
    "06": "ch06",
    "07": "ch07",
    "08": "ch08",
  },
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const board = url.searchParams.get("board") || "cbse";
  const cls   = url.searchParams.get("class") || "8";
  const ch    = url.searchParams.get("ch");
  const type  = url.searchParams.get("type") || "exam";

  if (!ch) {
    return new Response(
      JSON.stringify({ error: "Missing required param: ch" }),
      { status: 400, headers: corsHeaders("application/json") }
    );
  }

  // Normalise chId — accept "1", "01", "ch01", "11a", "ch11a"
  const chId = ch.replace(/^ch/i, "").toLowerCase();
  // Pad numeric-only ids to 2 digits; leave 11a/11b as-is
  const chIdPadded = /^\d+$/.test(chId) ? chId.padStart(2, "0") : chId;
  const kvKey = `${board}_${cls}_ch${chIdPadded}_${type}`;

  try {
    // 1. Try KV first
    if (env.RISHI_QUESTIONS) {
      const kvData = await env.RISHI_QUESTIONS.get(kvKey);
      if (kvData) {
        return new Response(kvData, {
          status: 200,
          headers: corsHeaders("application/json"),
        });
      }
    }

    // 2. Fall back to static JSON using class-aware folder map
    const classMap = FOLDER_MAP[cls] || FOLDER_MAP["8"];
    const folder   = classMap[chIdPadded];

    if (!folder) {
      return new Response(
        JSON.stringify({ error: `Unknown chapter id: ${ch} for class ${cls}` }),
        { status: 404, headers: corsHeaders("application/json") }
      );
    }

    const fileName = type === "exam"
      ? `ch${chIdPadded}-exam.json`
      : `ch${chIdPadded}-practice.json`;

    const staticPath = `/data/${board}/class${cls}/${folder}/${fileName}`;
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
      JSON.stringify({ error: `Questions not found. Tried: ${staticPath}` }),
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
