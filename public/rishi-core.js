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
  if (localStorage.getItem('rishi_admin_bypass') === '1') return; /* Admin bypass */

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
  if (localStorage.getItem('rishi_admin_bypass') === '1') return true; /* Admin bypass */

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

function rishiMarkPracticeDone(chId) {
  localStorage.setItem('rishi_practice_done_' + chId, '1');
  var sessKey = 'rishi_practice_sessions';
  var sess = {};
  try { sess = JSON.parse(localStorage.getItem(sessKey) || '{}'); } catch(e) {}
  sess[chId] = (sess[chId] || 0) + 1;
  localStorage.setItem(sessKey, JSON.stringify(sess));
}

function rishiIsPracticeDone(chId) {
  if (localStorage.getItem('rishi_admin_bypass') === '1') return true; /* Admin bypass */
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

/* ── BREAK LOGGING ──────────────────────────
   Automatically patches startBreak / endBreak
   in every explain page — no page edits needed.
   ─────────────────────────────────────────── */
var _rishiBreakType = '';
var _rishiBreakStart = 0;

function rishiLogBreak(type, secs) {
  if (!type || secs < 3) return; // ignore accidental clicks
  var log = [];
  try { log = JSON.parse(localStorage.getItem('rishi_break_log') || '[]'); } catch(e) {}
  log.push({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    type: type,
    secs: secs
  });
  localStorage.setItem('rishi_break_log', JSON.stringify(log));
}

// Patch startBreak + endBreak after page fully loads
window.addEventListener('load', function() {
  // Patch startBreak
  if (typeof window.startBreak === 'function') {
    var _origStart = window.startBreak;
    window.startBreak = function(r) {
      _rishiBreakType = r;
      _rishiBreakStart = Math.floor(Date.now() / 1000);
      rishiResetIdleTimer(); // user triggered break — reset idle
      _origStart(r);
    };
  }
  // Patch endBreak
  if (typeof window.endBreak === 'function') {
    var _origEnd = window.endBreak;
    window.endBreak = function() {
      var secs = _rishiBreakType ? Math.floor(Date.now() / 1000) - _rishiBreakStart : 0;
      rishiLogBreak(_rishiBreakType, secs);
      _rishiBreakType = '';
      _rishiBreakStart = 0;
      _origEnd();
      rishiResetIdleTimer(); // break ended — restart idle timer
    };
  }

  // ── IDLE BREAK DETECTOR ──────────────────────
  var IDLE_LIMIT = 5 * 60 * 1000; // 5 minutes
  var _idleTimer = null;
  var _idleOverlay = null;
  var _idleBreakStart = 0;

  window.rishiResetIdleTimer = function() {
    clearTimeout(_idleTimer);
    if (_rishiBreakType) return; // break already active
    _idleTimer = setTimeout(_rishiTriggerIdleBreak, IDLE_LIMIT);
  };

  function _rishiTriggerIdleBreak() {
    if (_rishiBreakType) return; // already in a break
    _idleBreakStart = Math.floor(Date.now() / 1000);
    _rishiBreakType = 'Idle';
    _rishiBreakStart = _idleBreakStart;

    _idleOverlay = document.createElement('div');
    _idleOverlay.id = 'rishi-idle-overlay';
    _idleOverlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,18,40,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Nunito,sans-serif;text-align:center;padding:24px';
    _idleOverlay.innerHTML = '<div style="font-size:56px;margin-bottom:16px">☕</div>'
      + '<div style="font-size:22px;font-weight:900;color:#F5A623;margin-bottom:8px">Taking a break?</div>'
      + '<div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:6px">You've been away for 5 minutes.</div>'
      + '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px">This break is being recorded.</div>'
      + '<div id="rishi-idle-timer" style="font-size:36px;font-weight:900;color:#fff;font-family:monospace;margin-bottom:28px">0:00</div>'
      + '<button onclick="rishiEndIdleBreak()" style="font-family:Nunito,sans-serif;font-size:16px;font-weight:800;padding:14px 36px;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#F5A623,#22C97D);color:#000;box-shadow:0 6px 24px rgba(245,166,35,.4)">✅ I'm Back — End Break</button>';
    document.body.appendChild(_idleOverlay);

    var _dispTimer = setInterval(function() {
      var el = document.getElementById('rishi-idle-timer');
      if (!el) { clearInterval(_dispTimer); return; }
      var elapsed = Math.floor(Date.now() / 1000) - _idleBreakStart;
      var m = Math.floor(elapsed / 60), s = elapsed % 60;
      el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
    _idleOverlay._dispTimer = _dispTimer;
  }

  window.rishiEndIdleBreak = function() {
    if (!_idleOverlay) return;
    clearInterval(_idleOverlay._dispTimer);
    var secs = Math.floor(Date.now() / 1000) - _idleBreakStart;
    rishiLogBreak('Idle', secs);
    _rishiBreakType = '';
    _rishiBreakStart = 0;
    document.body.removeChild(_idleOverlay);
    _idleOverlay = null;
    rishiResetIdleTimer();
  };

  // Activity listeners
  ['mousemove','mousedown','keydown','touchstart','scroll','click'].forEach(function(ev) {
    document.addEventListener(ev, rishiResetIdleTimer, { passive: true });
  });

  rishiResetIdleTimer(); // start on load
});
