/* ═══════════════════════════════════════════════════════════
   RISHI PRESENCE — rishi-presence.js  v2
   Include on every student page (after rishi-core.js)
   Handles: timing slots, heartbeat, presence log,
            session resume (explain + practice), expiry warnings
   Exam resume: rishiSaveExamState / rishiGetExamResume / rishiClearExamResume
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HEARTBEAT_MS = 30000;          /* 30 seconds */
  var LOG_CAP      = 200;
  var EXAM_TTL_MS  = 4 * 60 * 60 * 1000;   /* 4 hours  — exam resume */
  var PAGE_TTL_MS  = 24 * 60 * 60 * 1000;  /* 24 hours — page resume */

  /* ── HELPERS ─────────────────────────────────────────── */
  function presLog(type, detail) {
    var log = [];
    try { log = JSON.parse(localStorage.getItem('rishi_presence_log') || '[]'); } catch (e) {}
    log.push({
      ts:     Date.now(),
      type:   type,
      page:   location.pathname + location.search,
      detail: detail || ''
    });
    if (log.length > LOG_CAP) log = log.slice(-LOG_CAP);
    localStorage.setItem('rishi_presence_log', JSON.stringify(log));
  }

  function nowHHMM() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function timeToMins(hhmm) {
    var p = (hhmm || '00:00').split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function isInSlot() {
    var slots = [];
    try { slots = JSON.parse(localStorage.getItem('rishi_slots') || '[]'); } catch (e) {}
    if (!slots.length) return true;
    var now = timeToMins(nowHHMM());
    return slots.some(function (s) {
      return now >= timeToMins(s.start) && now < timeToMins(s.end);
    });
  }

  function isStudentPage() {
    var p = location.pathname;
    var skip = ['parent', 'admin', 'login', 'register', 'landing', 'coming-soon'];
    return !skip.some(function (k) { return p.indexOf(k) !== -1; });
  }

  function isExplainPage()   { return location.pathname.indexOf('/explain/')   !== -1; }
  function isPracticePage()  { return location.pathname.indexOf('/practice/')  !== -1; }
  function isLessonPage()    { return isExplainPage() || isPracticePage(); }

  /* ── SLOT LOCK OVERLAY ───────────────────────────────── */
  function showSlotLock() {
    var slots = [];
    try { slots = JSON.parse(localStorage.getItem('rishi_slots') || '[]'); } catch (e) {}
    var slotText = slots.length
      ? slots.map(function (s) { return s.start + '\u2013' + s.end; }).join(', ')
      : '';
    var msg = slotText
      ? 'Study time is ' + slotText + '. Come back then!'
      : 'Study time has not started yet. Come back later!';

    var el = document.createElement('div');
    el.id = 'rishi-slot-lock';
    el.style.cssText = [
      'position:fixed;inset:0;z-index:999999',
      'background:rgba(10,18,40,0.97)',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'font-family:Nunito,sans-serif;text-align:center;padding:24px'
    ].join(';');
    el.innerHTML = '<div style="font-size:64px;margin-bottom:16px">&#128274;</div>'
      + '<div style="font-size:22px;font-weight:900;color:#F5A623;margin-bottom:12px">Study time hasn\'t started yet</div>'
      + '<div style="font-size:15px;color:rgba(255,255,255,0.75);max-width:340px;line-height:1.6">' + msg + '</div>';
    document.body.appendChild(el);
  }

  /* ── EXPIRY WARNING ──────────────────────────────────── */
  function checkExpiryWarning() {
    var regs = [];
    try { regs = JSON.parse(localStorage.getItem('rishi_registrations') || '[]'); } catch(e) {}
    var cur = {};
    try { cur = JSON.parse(localStorage.getItem('rishi_current_student') || '{}'); } catch(e) {}

    var uId = (cur.studentUsername || cur.studentId || '').toLowerCase();
    var reg = null;
    for (var i = 0; i < regs.length; i++) {
      if ((regs[i].studentUsername || '').toLowerCase() === uId) { reg = regs[i]; break; }
    }
    if (!reg || !reg.subscriptionExpiry) return;

    var today  = new Date(); today.setHours(0,0,0,0);
    var expiry = new Date(reg.subscriptionExpiry);
    var days   = Math.ceil((expiry - today) / 86400000);
    var status = reg.subscriptionStatus || 'trial';

    if (days < 0 && status !== 'subscribed') {
      showExpiryBlock(status, expiry);
      return;
    }
    if (days >= 0 && days <= 3) {
      var lastWarn = localStorage.getItem('rishi_expiry_warned');
      var todayStr = today.toISOString().slice(0,10);
      if (lastWarn === todayStr) return;
      localStorage.setItem('rishi_expiry_warned', todayStr);
      showExpiryWarning(status, expiry, days);
    }
  }

  function showExpiryWarning(status, expiry, days) {
    var label  = status === 'trial' ? 'trial' : 'subscription';
    var dateStr = expiry.toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'});
    var dayMsg  = days === 0 ? 'today!' : 'in ' + days + ' day' + (days === 1 ? '' : 's') + ' on ' + dateStr;

    var el = document.createElement('div');
    el.id  = 'rishi-expiry-warn';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99998;background:#1e293b;border:1px solid #f59e0b;border-radius:16px;padding:16px 20px;max-width:360px;width:90%;font-family:Nunito,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    el.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;">'
      + '<div style="font-size:28px;flex-shrink:0;">&#9203;</div>'
      + '<div style="flex:1;">'
      + '<div style="font-size:14px;font-weight:800;color:#f59e0b;margin-bottom:4px;">Your ' + label + ' is expiring ' + dayMsg + '</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;">Please contact your admin to renew and keep learning!</div>'
      + '</div>'
      + '<button onclick="document.getElementById(\'rishi-expiry-warn\').remove()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:18px;cursor:pointer;padding:0;flex-shrink:0;line-height:1;">&#10005;</button>'
      + '</div>';
    document.body.appendChild(el);
    setTimeout(function() { var w = document.getElementById('rishi-expiry-warn'); if(w) w.remove(); }, 10000);
  }

  function showExpiryBlock(status, expiry) {
    var label   = status === 'trial' ? 'Trial' : 'Subscription';
    var dateStr = expiry.toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'});
    var el = document.createElement('div');
    el.id  = 'rishi-expiry-block';
    el.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(10,18,40,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Nunito,sans-serif;text-align:center;padding:24px;';
    el.innerHTML = '<div style="font-size:64px;margin-bottom:16px;">&#128274;</div>'
      + '<div style="font-size:22px;font-weight:900;color:#f59e0b;margin-bottom:10px;">' + label + ' Expired</div>'
      + '<div style="font-size:15px;color:rgba(255,255,255,0.75);max-width:340px;line-height:1.6;margin-bottom:6px;">Your ' + label.toLowerCase() + ' expired on ' + dateStr + '.</div>'
      + '<div style="font-size:14px;color:rgba(255,255,255,0.5);">Please contact your admin to renew access.</div>';
    document.body.appendChild(el);
  }

  /* ── SESSION RESUME — EXPLAIN & PRACTICE ────────────────
     Zero changes needed in individual pages.
     Reads window.idx (global in all lesson pages).
     Explain navigation: window.idx = n; window.showQ()
     Practice navigation: window.loadQ(n)
     ─────────────────────────────────────────────────────── */
  var RESUME_KEY_PREFIX = 'rishi_page_resume_';

  function resumeKey() {
    return RESUME_KEY_PREFIX + location.pathname;
  }

  function savePageState() {
    if (!isLessonPage()) return;
    /* Clear if lesson completed */
    if (window.completed === true || window.sessionOver === true) {
      localStorage.removeItem(resumeKey());
      return;
    }
    var idx = (typeof window.idx === 'number') ? window.idx : -1;
    if (idx <= 0) return; /* At Q1 — not worth saving */
    localStorage.setItem(resumeKey(), JSON.stringify({ idx: idx, ts: Date.now() }));
  }

  function clearPageResume() {
    localStorage.removeItem(resumeKey());
  }

  function checkPageResume() {
    if (!isLessonPage()) return;
    var raw = localStorage.getItem(resumeKey());
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || typeof data.idx !== 'number' || data.idx <= 0) return;
    if (Date.now() - data.ts > PAGE_TTL_MS) { clearPageResume(); return; }
    /* Only show if still at the beginning (page just loaded fresh) */
    if (typeof window.idx === 'number' && window.idx > 0) return;
    showResumePrompt(data.idx);
  }

  function showResumePrompt(savedIdx) {
    var qNum = savedIdx + 1; /* Display as 1-indexed */
    var el = document.createElement('div');
    el.id = 'rishi-resume-prompt';
    el.style.cssText = [
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%)',
      'z-index:99997',
      'background:#1e293b',
      'border:2px solid #6366f1',
      'border-radius:18px',
      'padding:18px 22px',
      'max-width:380px;width:92%',
      'font-family:Nunito,sans-serif',
      'box-shadow:0 8px 32px rgba(0,0,0,0.45)',
      'animation:rishi-slide-up 0.35s ease'
    ].join(';');

    /* Inject animation keyframe once */
    if (!document.getElementById('rishi-resume-anim')) {
      var style = document.createElement('style');
      style.id = 'rishi-resume-anim';
      style.textContent = '@keyframes rishi-slide-up{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(style);
    }

    el.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;">'
      + '<div style="font-size:26px;flex-shrink:0;margin-top:2px;">&#128218;</div>'
      + '<div style="flex:1;">'
      + '<div style="font-size:15px;font-weight:900;color:#a5b4fc;margin-bottom:4px;">Continue where you left off?</div>'
      + '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5;margin-bottom:12px;">You were on <strong style="color:#fff">Question ' + qNum + '</strong> last time.</div>'
      + '<div style="display:flex;gap:8px;">'
      + '<button id="rishi-resume-yes" style="flex:1;padding:9px 0;background:linear-gradient(135deg,#6366f1,#818cf8);border:none;border-radius:10px;font-size:14px;font-weight:800;color:#fff;cursor:pointer;font-family:Nunito,sans-serif;">&#9654; Resume Q' + qNum + '</button>'
      + '<button id="rishi-resume-no"  style="flex:1;padding:9px 0;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.6);cursor:pointer;font-family:Nunito,sans-serif;">Start Over</button>'
      + '</div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(el);

    document.getElementById('rishi-resume-yes').addEventListener('click', function () {
      el.remove();
      doResume(savedIdx);
    });
    document.getElementById('rishi-resume-no').addEventListener('click', function () {
      el.remove();
      clearPageResume();
    });

    /* Auto-dismiss after 15 seconds */
    setTimeout(function () { var p = document.getElementById('rishi-resume-prompt'); if (p) p.remove(); }, 15000);
  }

  function doResume(savedIdx) {
    if (isExplainPage() && typeof window.showQ === 'function') {
      window.idx = savedIdx;
      window.showQ();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isPracticePage() && typeof window.loadQ === 'function') {
      window.loadQ(savedIdx);
    }
    clearPageResume();
  }

  /* Poll for completion — clears saved state automatically */
  function watchCompletion() {
    if (!isLessonPage()) return;
    var pollInt = setInterval(function () {
      if (window.completed === true || window.sessionOver === true) {
        clearPageResume();
        clearInterval(pollInt);
      }
    }, 5000);
  }

  /* ── HEARTBEAT ───────────────────────────────────────── */
  function heartbeat() {
    var now = Date.now();
    localStorage.setItem('rishi_presence_online', now);
    localStorage.setItem('rishi_presence_page',   location.pathname + location.search);
    /* Also write student-specific key — admin reads rishi_presence_online_<sid> */
    try {
      var cur = JSON.parse(localStorage.getItem('rishi_current_student') || '{}');
      var sid = (cur.studentUsername || cur.studentId || '').toLowerCase();
      if (sid) localStorage.setItem('rishi_presence_online_' + sid, now);
    } catch (e) {}
    savePageState();
  }

  /* ── MAIN INIT ───────────────────────────────────────── */
  window.addEventListener('load', function () {

    /* Admin bypass — sessionStorage ONLY (not localStorage) */
    if (sessionStorage.getItem('rishi_admin_bypass') === '1') {
      heartbeat();
      setInterval(heartbeat, HEARTBEAT_MS);
      presLog('load_bypass');
      return;
    }

    /* Slot check for student pages only */
    if (isStudentPage()) {
      if (!isInSlot()) {
        showSlotLock();
        presLog('slot_locked');
        return;
      }
      checkExpiryWarning();
    }

    /* Heartbeat */
    heartbeat();
    setInterval(heartbeat, HEARTBEAT_MS);

    /* Page load event */
    presLog('load');

    /* Visibility / unload events */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        savePageState(); /* save before going hidden */
        localStorage.setItem('rishi_presence_offline', Date.now());
        presLog('offline');
      } else {
        heartbeat();
        presLog('online');
      }
    });

    window.addEventListener('beforeunload', function () {
      savePageState(); /* save on page close */
      localStorage.setItem('rishi_presence_offline', Date.now());
    });

    /* Session resume — check after 1.5s to let QB render first */
    if (isLessonPage()) {
      setTimeout(checkPageResume, 1500);
      watchCompletion();
    }
  });

  /* ══ EXAM RESUME PUBLIC API ══════════════════════════════
     Called from exam.html, topic-exam.html, sampurna-pariksha.html
     ─────────────────────────────────────────────────────── */
  window.rishiSaveExamState = function (chIdStr, timerSecs, currentIdx) {
    localStorage.setItem('rishi_exam_resume_' + chIdStr, JSON.stringify({
      timerSecs:  timerSecs,
      currentIdx: currentIdx,
      ts:         Date.now()
    }));
  };

  window.rishiGetExamResume = function (chIdStr) {
    try {
      var d = JSON.parse(localStorage.getItem('rishi_exam_resume_' + chIdStr) || 'null');
      if (!d) return null;
      if (Date.now() - d.ts > EXAM_TTL_MS) {
        localStorage.removeItem('rishi_exam_resume_' + chIdStr);
        return null;
      }
      return d;
    } catch (e) { return null; }
  };

  window.rishiClearExamResume = function (chIdStr) {
    localStorage.removeItem('rishi_exam_resume_' + chIdStr);
  };

})();
