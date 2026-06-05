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

// Helper: build a 1:1 chXX→chXX map for a range of chapter numbers
function _chMap(nums) {
  const m = {};
  nums.forEach(function(n) {
    const k = String(n).padStart(2,'0');
    m[k] = 'ch' + k;
  });
  return m;
}
function _range(a, b) { const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; }

// FOLDER_MAP[key][chId] → folder name
// Keys: plain class number (CBSE default), or "icse_N" for ICSE-specific overrides.
// Lookup order (in code below): "${board}_${cls}" → "${cls}" → {}
const FOLDER_MAP = {
  // CBSE class 8 — some chapters share topic folders (non-1:1)
  "cbse_8": {
    "01":  "ch01", "08": "ch01", "12": "ch01", "13": "ch01",
    "02":  "ch02", "09": "ch02", "14": "ch02",
    "03":  "ch03", "04": "ch03", "10": "ch03",
    "05":  "ch05",
    "06":  "ch06", "07": "ch07",
    "11a": "ch11", "11b": "ch11",
    "15":  "ch15", "16": "ch16", "17": "ch17", "18": "ch18",
  },
  // ICSE class 8 — 1:1 mapping, ch01-ch21
  "icse_8": _chMap(_range(1, 21)),
  // CBSE class 9 — 1:1 ch01-ch12
  "9": _chMap(_range(1, 12)),
  // Class 7 — CBSE ch01-ch08, ICSE ch01-ch22 (1:1 for all)
  "7": _chMap(_range(1, 22)),
  // Class 6 — CBSE ch01-ch10, ICSE up to ch28; gaps (ch07,ch12,ch17,ch24,ch25,ch27) may not exist but won't error
  "6": Object.assign(_chMap(_range(1, 28)), {
    // ICSE class 6 has gaps — known present: 01-06,08-11,13-16,18-23,26,28
    // Missing folders gracefully return 404 and fall to KV
  }),
};


// Convert new question bank format (flat array) → old sections format
function bankToSections(bankData) {
  const letters = ['a','b','c','d'];
  const qs = (bankData.questions || []).map(function(q) {
    return {
      id:          q.id,
      text:        q.q,
      options:     { a: q.options[0], b: q.options[1], c: q.options[2], d: q.options[3] },
      correct:     letters[Math.min(q.correct, 3)] || 'a',
      difficulty:  q.difficulty || 'medium',
      explanation: q.explanation || ''
    };
  });
  return {
    meta: {
      board:        (bankData.meta && bankData.meta.board)       || 'cbse',
      class:        (bankData.meta && bankData.meta.class)       || 8,
      chapter_id:   (bankData.meta && bankData.meta.chId)        || '',
      chapter_name: (bankData.meta && bankData.meta.chapterName) || '',
      topic_group:  ''
    },
    sections: {
      A: {
        type:        'mcq',
        label:       'Conceptual',
        marks_per_q: 1,
        questions:   qs
      }
    }
  };
}

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
    const classMap = FOLDER_MAP[`${board}_${cls}`] || FOLDER_MAP[cls] || {};
    const folder   = classMap[chIdPadded];

    // For exam type: if a static file exists in FOLDER_MAP, try it FIRST.
    // This prevents stale KV bank-format data (Section A only) from overriding
    // the authoritative 52-question static exam files.
    if (type === "exam" && folder) {
      const fileName  = `ch${chIdPadded}-exam.json`;
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
    }

    // 1. Try KV (try both _exam and _chapter_exam tags)
    if (env.RISHI_QUESTIONS) {
      const kvKey2 = `${board}_${cls}_ch${chIdPadded}_chapter_exam`;
      let kvData = await env.RISHI_QUESTIONS.get(kvKey);
      if (!kvData) kvData = await env.RISHI_QUESTIONS.get(kvKey2);
      if (kvData) {
        // Parse and check if it's the new bank format (has questions array)
        try {
          const parsed = JSON.parse(kvData);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            // New bank format → convert to sections format
            return new Response(JSON.stringify(bankToSections(parsed)), {
              status: 200,
              headers: corsHeaders("application/json"),
            });
          }
        } catch(e) {}
        // Old sections format — return as-is
        return new Response(kvData, {
          status: 200,
          headers: corsHeaders("application/json"),
        });
      }
    }

    // 2. Fall back to static JSON using class-aware folder map (for non-exam type
    //    or when static exam file was not found above)
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
