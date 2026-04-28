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

  /* ── EXPIRY WARNING ─────────────────────────────────────── */
  function checkExpiryWarning() {
    var regs = [];
    try { regs = JSON.parse(localStorage.getItem('rishi_registrations') || '[]'); } catch(e) {}
    var cur = {};
    try { cur = JSON.parse(localStorage.getItem('rishi_current_student') || '{}'); } catch(e) {}

    /* Find current student's registration */
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

    /* Expired — hard block */
    if (days < 0 && status !== 'subscribed') {
      showExpiryBlock(status, expiry);
      return;
    }

    /* Within 3 days — soft warning */
    if (days >= 0 && days <= 3) {
      /* Show once per day only */
      var lastWarn = localStorage.getItem('rishi_expiry_warned');
      var todayStr = today.toISOString().slice(0,10);
      if (lastWarn === todayStr) return;
      localStorage.setItem('rishi_expiry_warned', todayStr);
      showExpiryWarning(status, expiry, days);
    }
  }

  function showExpiryWarning(status, expiry, days) {
    var label = status === 'trial' ? 'trial' : 'subscription';
    var dateStr = expiry.toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'});
    var dayMsg  = days === 0 ? 'today!' : 'in ' + days + ' day' + (days === 1 ? '' : 's') + ' on ' + dateStr;

    var el = document.createElement('div');
    el.id  = 'rishi-expiry-warn';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99998;background:#1e293b;border:1px solid #f59e0b;border-radius:16px;padding:16px 20px;max-width:360px;width:90%;font-family:Nunito,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    el.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;">'
      + '<div style="font-size:28px;flex-shrink:0;">⏳</div>'
      + '<div style="flex:1;">'
      + '<div style="font-size:14px;font-weight:800;color:#f59e0b;margin-bottom:4px;">Your ' + label + ' is expiring ' + dayMsg + '</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;">Please contact your admin to renew and keep learning!</div>'
      + '</div>'
      + '<button onclick="document.getElementById(\'rishi-expiry-warn\').remove()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:18px;cursor:pointer;padding:0;flex-shrink:0;line-height:1;">✕</button>'
      + '</div>';
    document.body.appendChild(el);
    /* Auto-dismiss after 10s */
    setTimeout(function() { var w = document.getElementById('rishi-expiry-warn'); if(w) w.remove(); }, 10000);
  }

  function showExpiryBlock(status, expiry) {
    var label   = status === 'trial' ? 'Trial' : 'Subscription';
    var dateStr = expiry.toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'});
    var el = document.createElement('div');
    el.id  = 'rishi-expiry-block';
    el.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(10,18,40,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Nunito,sans-serif;text-align:center;padding:24px;';
    el.innerHTML = '<div style="font-size:64px;margin-bottom:16px;">🔒</div>'
      + '<div style="font-size:22px;font-weight:900;color:#f59e0b;margin-bottom:10px;">' + label + ' Expired</div>'
      + '<div style="font-size:15px;color:rgba(255,255,255,0.75);max-width:340px;line-height:1.6;margin-bottom:6px;">Your ' + label.toLowerCase() + ' expired on ' + dateStr + '.</div>'
      + '<div style="font-size:14px;color:rgba(255,255,255,0.5);">Please contact your admin to renew access.</div>';
    document.body.appendChild(el);
  }

  /* ── HEARTBEAT ───────────────────────────────────────── */
  function heartbeat() {
    localStorage.setItem('rishi_presence_online', Date.now());
    localStorage.setItem('rishi_presence_page',   location.pathname + location.search);
  }

  /* ── MAIN INIT ───────────────────────────────────────── */
  window.addEventListener('load', function () {

    /* Admin bypass — skip all restrictions */
    if (localStorage.getItem('rishi_admin_bypass') === '1') {
      heartbeat();
      setInterval(heartbeat, HEARTBEAT_MS);
      presLog('load');
      return;
    }

    /* Slot check for student pages only */
    if (isStudentPage()) {
      if (!isInSlot()) {
        showSlotLock();
        presLog('slot_locked');
        return;
      }
      /* Expiry warning — 3 days before or already expired */
      checkExpiryWarning();
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
