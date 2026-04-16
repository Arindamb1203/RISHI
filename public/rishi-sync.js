/* ═══════════════════════════════════════════
   RISHI SYNC — rishi-sync.js  v1.0
   Cloud sync wrapper over localStorage.
   Include BEFORE rishi-core.js on every page.

   How it works:
   — Intercepts localStorage.setItem silently
   — Pushes rishi_* keys to Cloudflare D1
   — Pulls student data from D1 on page load
   — rishi_active_chapters: cloud always wins
     (parent sets, student reads cross-device)
   — All other keys: localStorage wins if set
     (student progress is trusted locally)
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var ENDPOINT = '/functions/d1-sync';

  /* ── Keys that sync to/from cloud ── */
  var SYNC_EXACT = [
    'rishi_chapter_progress',
    'rishi_explain_sessions',
    'rishi_practice_sessions',
    'rishi_break_log',
    'rishi_hour_pattern',
    'rishi_heatmap',
    'rishi_exam_scores',
    'rishi_progress',
    'rishi_active_chapters'
  ];

  var SYNC_PREFIX = [
    'rishi_explain_done_',
    'rishi_practice_done_',
    'rishi_chapexam_done_'
  ];

  function shouldSync(key) {
    if (!key) return false;
    if (SYNC_EXACT.indexOf(key) !== -1) return true;
    for (var i = 0; i < SYNC_PREFIX.length; i++) {
      if (key.indexOf(SYNC_PREFIX[i]) === 0) return true;
    }
    return false;
  }

  /* ── Resolve student identity ──
     Priority:
     1. rishi_selected_student  (parent portal sets this)
     2. rishi_current_student   (login page sets this on student device)
     3. null → don't sync
  ── */
  function getStudentId() {
    var sel = localStorage.getItem('rishi_selected_student');
    if (sel && sel.trim()) return sel.trim().toLowerCase();

    var raw = localStorage.getItem('rishi_current_student');
    if (raw) {
      try {
        var obj = JSON.parse(raw);
        var name = ((obj.name || obj.id || '')).trim();
        if (name) return name.toLowerCase();
      } catch (e) {}
    }
    return null;
  }

  /* Keep original bound reference for internal use
     (so our overridden setItem doesn't cause infinite loop) */
  var _origSet = localStorage.setItem.bind(localStorage);

  /* ── Push one key to D1 (fire and forget) ── */
  function pushKey(key, value, studentId) {
    var sid = studentId || getStudentId();
    if (!sid) return;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', studentId: sid, key: key, value: value })
    }).catch(function () {}); /* Silent — offline is fine */
  }

  /* ── Pull all keys for a student from D1 ── */
  function pullForStudent(studentId, callback) {
    if (!studentId) { if (typeof callback === 'function') callback(); return; }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', studentId: studentId })
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res.ok || !res.data) { if (typeof callback === 'function') callback(); return; }

      res.data.forEach(function (row) {
        if (row.key === 'rishi_active_chapters') {
          /* Parent's chapter assignments → cloud always wins */
          _origSet(row.key, row.value);
        } else {
          /* Student progress → only restore if localStorage is empty for this key */
          if (localStorage.getItem(row.key) === null) {
            _origSet(row.key, row.value);
          }
        }
      });

      if (typeof callback === 'function') callback();
    })
    .catch(function () {
      if (typeof callback === 'function') callback();
    });
  }

  /* ── Intercept localStorage.setItem ── */
  localStorage.setItem = function (key, value) {
    _origSet(key, value);
    if (shouldSync(key)) pushKey(key, value);
  };

  /* ── Auto-pull on page load ── */
  document.addEventListener('DOMContentLoaded', function () {
    var sid = getStudentId();
    if (sid) pullForStudent(sid);
  });

  /* ── Public API ── */
  window.rishiSync = {

    /* Parent portal: select which student to view/sync for.
       Call this when parent picks a student name.
       Pulls that student's data into localStorage, then
       calls optional callback (e.g. renderAll). */
    selectStudent: function (name, callback) {
      if (!name || !name.trim()) return;
      var sid = name.trim().toLowerCase();
      _origSet('rishi_selected_student', sid);
      pullForStudent(sid, callback);
    },

    /* Pull current student's data from cloud.
       Useful for manual refresh or polling. */
    pull: function (callback) {
      var sid = getStudentId();
      if (sid) pullForStudent(sid, callback);
      else if (typeof callback === 'function') callback();
    },

    /* Push ALL syncable keys currently in localStorage to cloud.
       Useful on first login to seed cloud from an existing device. */
    pushAll: function () {
      var sid = getStudentId();
      if (!sid) return;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (shouldSync(k)) {
          var v = localStorage.getItem(k);
          if (v !== null) pushKey(k, v, sid);
        }
      }
    },

    /* Returns the resolved student ID (for debugging) */
    getStudentId: getStudentId
  };

}());
