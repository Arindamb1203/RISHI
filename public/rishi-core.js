/* ═══════════════════════════════════════════
   RISHI CORE — rishi-core.js
   Include in every explain/practice/exam page
   ═══════════════════════════════════════════ */

/* Map chapter ID → legacy progress key (for backwards compat) */
var RISHI_LEGACY_KEYS = {
  2:  "explain_linear_done",
  3:  "explain_quadrilaterals_done",
  4:  "explain_practical_done",
  9:  "explain_algebraic_done",
  11: "explain_area_done",
  15: "explain_graphs_done"
};

/* ── PLAN CHECK ─────────────────────────────
   Call at top of init() in every explain page.
   chId = integer chapter ID (e.g. 2 for Linear Equations)
   If chapter not in parent's plan → redirect to syllabus.
   ─────────────────────────────────────────── */
function rishiCheckPlan(chId) {
  var active = {};
  try { active = JSON.parse(localStorage.getItem("rishi_active_chapters") || "{}"); } catch(e) {}

  /* No plan at all → allow access (parent hasn't set anything yet) */
  var planKeys = Object.keys(active);
  if (planKeys.length === 0) return;

  /* Plan exists but this chapter not in it → redirect */
  if (!active[chId]) {
    var ch = rishiChName(chId);
    window.location.href = "/syllabus.html?locked=" + chId + "&name=" + encodeURIComponent(ch);
  }
}

/* ── MARK EXPLAIN COMPLETE ──────────────────
   Call inside onComplete() of every explain page.
   Writes standardised key + legacy key.
   ─────────────────────────────────────────── */
function rishiMarkExplainDone(chId) {
  /* Standardised key */
  var key = "rishi_explain_done_" + chId;
  localStorage.setItem(key, "1");

  /* Legacy key (for existing pages that also check it) */
  var legKey = RISHI_LEGACY_KEYS[chId];
  if (legKey) {
    var prog = {};
    try { prog = JSON.parse(localStorage.getItem("rishi_progress") || "{}"); } catch(e) {}
    prog[legKey] = true;
    localStorage.setItem("rishi_progress", JSON.stringify(prog));
  }

  /* Record explain session count */
  var sessKey = "rishi_explain_sessions";
  var sess = {};
  try { sess = JSON.parse(localStorage.getItem(sessKey) || "{}"); } catch(e) {}
  sess[chId] = (sess[chId] || 0) + 1;
  localStorage.setItem(sessKey, JSON.stringify(sess));
}

/* ── READ HELPERS ───────────────────────────*/
function rishiIsExplainDone(chId) {
  if (localStorage.getItem("rishi_explain_done_" + chId) === "1") return true;
  /* Check legacy key too */
  var legKey = RISHI_LEGACY_KEYS[chId];
  if (legKey) {
    var prog = {};
    try { prog = JSON.parse(localStorage.getItem("rishi_progress") || "{}"); } catch(e) {}
    if (prog[legKey]) return true;
  }
  return false;
}

function rishiIsPracticeDone(chId) {
  return localStorage.getItem("rishi_practice_done_" + chId) === "1";
}

function rishiIsChapExamDone(chId) {
  return localStorage.getItem("rishi_chapexam_done_" + chId) === "1";
}

function rishiChName(chId) {
  var names = {
    1:"Rational Numbers",2:"Linear Equations",3:"Understanding Quadrilaterals",
    4:"Practical Geometry",5:"Data Handling",6:"Squares and Square Roots",
    7:"Cubes and Cube Roots",8:"Comparing Quantities",9:"Algebraic Expressions & Identities",
    10:"Visualising Solid Shapes",11:"Mensuration",12:"Exponents and Powers",
    13:"Direct & Inverse Proportions",14:"Factorisation",15:"Introduction to Graphs",
    16:"Playing with Numbers"
  };
  return names[chId] || "Chapter " + chId;
}
