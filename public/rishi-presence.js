/* ═══════════════════════════════════════════════════════════
   RISHI PRESENCE — rishi-presence.js
   Include on every student page (after rishi-core.js)
   Handles: timing slots, heartbeat, presence log
   Exam resume handled via API: rishiSaveExamState /
            rishiGetExamResume / rishiClearExamResume
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HEARTBEAT_MS = 30000;
  var LOG_CAP      = 200;
  var EXAM_TTL_MS  = 4 * 60 * 60 * 1000; /* 4 hours */

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
    if (!slots.length) return true; /* no slots set = always allowed */
    var now = timeToMins(nowHHMM());
    return slots.some(function (s) {
      return now >= timeToMins(s.start) && now < timeToMins(s.end);
    });
  }

  function isStudentPage() {
    var p = location.pathname;
    /* Skip parent portal, admin, login, register, landing pages */
    var skip = ['parent', 'admin', 'login', 'register', 'landing', 'coming-soon'];
    return !skip.some(function (k) { return p.indexOf(k) !== -1; });
  }

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

  /* ── HEARTBEAT ───────────────────────────────────────── */
  function heartbeat() {
    localStorage.setItem('rishi_presence_online', Date.now());
    localStorage.setItem('rishi_presence_page',   location.pathname + location.search);
  }

  /* ── MAIN INIT ───────────────────────────────────────── */
  window.addEventListener('load', function () {

    /* Slot check for student pages only */
    if (isStudentPage()) {
      if (!isInSlot()) {
        showSlotLock();
        presLog('slot_locked');
        return; /* stop — do not start heartbeat or log load */
      }
    }

    /* Heartbeat */
    heartbeat();
    setInterval(heartbeat, HEARTBEAT_MS);

    /* Page load event */
    presLog('load');

    /* Offline / online events */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        localStorage.setItem('rishi_presence_offline', Date.now());
        presLog('offline');
      } else {
        heartbeat();
        presLog('online');
      }
    });

    window.addEventListener('beforeunload', function () {
      localStorage.setItem('rishi_presence_offline', Date.now());
    });
  });

  /* ══ EXAM RESUME PUBLIC API ══════════════════════════════
     Called from exam.html and topic-exam.html / sampurna-pariksha.html
     ──────────────────────────────────────────────────────── */

  /* Save timer + question position every 10s from exam.html */
  window.rishiSaveExamState = function (chIdStr, timerSecs, currentIdx) {
    localStorage.setItem('rishi_exam_resume_' + chIdStr, JSON.stringify({
      timerSecs:  timerSecs,
      currentIdx: currentIdx,
      ts:         Date.now()
    }));
  };

  /* Retrieve saved state — returns null if missing or expired */
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

  /* Clear on exam complete / retry */
  window.rishiClearExamResume = function (chIdStr) {
    localStorage.removeItem('rishi_exam_resume_' + chIdStr);
  };

})();
