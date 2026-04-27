/**
 * explain-helper.js — RISHI "I Don't Understand" engine v2
 * Include on all 16 explain pages: <script src="/explain-helper.js"></script>
 *
 * What it does:
 *   After all steps finish and "✅ I Understand!" appears, a second button
 *   "🤔 I Don't Understand" appears beside it. Clicking it fetches a fresh
 *   explanation (story / analogy / worked example) from /api/explain-differently.
 *   Student can keep pressing it — cycles Method 2, Method 3, then recycles.
 *
 * Double-button bug fix:
 *   If page code creates two "I Understand!" buttons (happens when student clicks
 *   "Next Step" before the auto-timeout fires), the second one is removed silently.
 *
 * Assumptions (true for all 16 explain pages):
 *   - window.session[window.idx] has .q and .steps[]
 *   - #qArea is the main scrollable content div
 *   - #stepsWrap is the container the buttons are appended to
 *   - .topbar-center has the chapter name
 *   - .step / .step-num / .step-body CSS classes exist
 *   - window.say(text, callback) is available
 */

(function () {
  'use strict';

  var methodCount = 0;   // how many alternate methods fetched so far
  var injected    = false; // guard against double injection
  var prevSteps   = [];  // accumulates all previous step texts for the API

  /* ── Boot ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    var qArea = document.getElementById('qArea');
    if (!qArea) { setTimeout(boot, 400); return; }

    /* Reset state whenever qArea is wiped (new question) */
    var lastLen = qArea.innerHTML.length;
    var resetObs = new MutationObserver(function () {
      var nowLen = qArea.innerHTML.length;
      if (nowLen < 200 && nowLen < lastLen) {
        methodCount = 0;
        injected    = false;
        prevSteps   = [];
      }
      lastLen = nowLen;
    });
    resetObs.observe(qArea, { childList: true });

    /* Watch for "I Understand!" being added */
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          scanNode(nodes[j]);
        }
      }
    });
    obs.observe(qArea, { childList: true, subtree: true });
  }

  /* ── Scan a newly added node for "I Understand!" ───────── */
  function scanNode(node) {
    if (node.nodeType !== 1) return;
    if (isUnderstandBtn(node)) { handleUnderstandBtn(node); return; }
    var btns = node.querySelectorAll ? node.querySelectorAll('button') : [];
    for (var i = 0; i < btns.length; i++) {
      if (isUnderstandBtn(btns[i])) { handleUnderstandBtn(btns[i]); return; }
    }
  }

  function isUnderstandBtn(el) {
    return el && el.tagName === 'BUTTON' &&
           el.innerHTML && el.innerHTML.indexOf('I Understand') !== -1 &&
           el.className.indexOf('btn-dont') === -1;
  }

  /* ── Handle "I Understand!" found ─────────────────────── */
  function handleUnderstandBtn(btn) {
    var parent = btn.parentNode;
    if (!parent) return;

    /* Fix double-button bug: remove duplicate "I Understand" buttons */
    var allBtns = parent.querySelectorAll('button');
    var iuSeen = false;
    for (var k = 0; k < allBtns.length; k++) {
      if (isUnderstandBtn(allBtns[k])) {
        if (iuSeen) { allBtns[k].remove(); }
        else { iuSeen = true; }
      }
    }

    /* Avoid double injection */
    if (injected || parent.querySelector('.btn-dont')) return;
    injected = true;

    /* Capture original steps for the API */
    try {
      var q = window.session[window.idx];
      prevSteps = (q.steps || []).map(function (s) {
        return typeof s === 'object' ? (s.t || s.text || '') : String(s);
      });
    } catch (e) {}

    /* Shrink "I Understand" to half-width */
    btn.style.width = '48%';
    btn.style.display = 'inline-block';
    btn.style.verticalAlign = 'top';
    btn.style.marginTop = '16px';

    /* Build "I Don't Understand" button */
    var dontBtn = document.createElement('button');
    dontBtn.className = 'btn-speak btn-dont';
    dontBtn.innerHTML = '&#129300; I Don\'t Understand';
    dontBtn.style.cssText =
      'margin-top:16px;width:48%;display:inline-block;vertical-align:top;' +
      'margin-left:4%;background:linear-gradient(135deg,#7a4aaa,#a06aee);' +
      'color:#fff;border-color:#7a4aaa;font-family:Nunito,sans-serif;' +
      'font-size:11px;font-weight:900;padding:5px 11px;border-radius:20px;' +
      'border:2px solid #7a4aaa;cursor:pointer;';
    dontBtn.onclick = function () { fetchNewMethod(dontBtn, btn); };

    parent.appendChild(dontBtn);

    setTimeout(function () {
      dontBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  }

  /* ── Fetch a new method from Gemini ───────────────────── */
  function fetchNewMethod(dontBtn, understandBtn) {
    dontBtn.disabled = true;
    dontBtn.innerHTML = '&#8987; Finding another way...';

    var concept = '';
    var chapter = 'Mathematics';

    try {
      var q = window.session[window.idx];
      concept = q.q || q.question || '';
    } catch (e) {}

    var tc = document.querySelector('.topbar-center');
    if (tc) chapter = tc.textContent.trim().replace(/^[^\w\u0900-\u097F]+/, '').trim() || chapter;

    fetch('/api/explain-differently', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept:  concept,
        chapter:  chapter,
        steps:    prevSteps,
        attempt:  methodCount + 1
      })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data.steps || !data.steps.length) throw new Error('Empty');
      methodCount++;

      /* Add new steps to prevSteps so next call knows what was shown */
      var newTexts = data.steps.map(function (s) {
        return typeof s === 'object' ? (s.t || s.text || '') : String(s);
      });
      prevSteps = prevSteps.concat(newTexts);

      /* Restore button label */
      dontBtn.disabled = false;
      dontBtn.innerHTML = '&#129300; Try Another Way';

      renderMethod(data.steps, methodCount, understandBtn);
    })
    .catch(function () {
      dontBtn.disabled = false;
      dontBtn.innerHTML = '&#129300; I Don\'t Understand';
      showErr(dontBtn.parentNode, 'Couldn\'t reach server. Try again!');
    });
  }

  /* ── Render a fresh method card ───────────────────────── */
  function renderMethod(steps, num, understandBtn) {
    var qArea = document.getElementById('qArea');
    if (!qArea) return;

    var labels = ['', 'Another Way to Think About It',
                      'Yet Another Approach', 'One More Way'];
    var label  = labels[num] || ('Method ' + (num + 1));

    var card = document.createElement('div');
    card.className = 'q-card eh-method-card';
    card.style.cssText = 'border-color:#7a4aaa;margin-top:10px;';
    card.innerHTML =
      '<div class="q-label" style="color:#7a4aaa;">&#129760; ' + escHtml(label) + '</div>' +
      '<div class="eh-steps-wrap"></div>';
    qArea.appendChild(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var wrap  = card.querySelector('.eh-steps-wrap');
    var delay = 300;

    for (var i = 0; i < steps.length; i++) {
      (function (text, stepNum, d) {
        var isAns  = /^Answer:/i.test(text);
        var lbl    = isAns ? '&#10003;' : String(stepNum);
        var numBg  = isAns
          ? 'background:linear-gradient(135deg,#5a8a60,#7ab87a);border-color:#3a6a40;'
          : 'background:linear-gradient(135deg,#7a4aaa,#a06aee);border-color:#4a2a7a;';

        var div = document.createElement('div');
        div.className = 'step';
        div.innerHTML =
          '<div class="step-num" style="' + numBg + '">' + lbl + '</div>' +
          '<div class="step-body">' + escHtml(text) + '</div>';
        wrap.appendChild(div);

        setTimeout(function () {
          div.classList.add('vis');
          if (typeof window.say === 'function') {
            var plain = text.replace(/^Step\s*\d+:\s*/i, '').replace(/^Answer:\s*/i, '');
            window.say(plain);
          }
        }, d);
      })(steps[i], i + 1, delay);

      delay += /^Answer:/i.test(steps[i]) ? 400 : 3200;
    }

    /* After all steps, scroll "I Understand" back into view */
    setTimeout(function () {
      if (understandBtn) {
        understandBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, delay + 600);
  }

  /* ── Helpers ───────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showErr(container, msg) {
    if (!container) return;
    var old = container.querySelector('.eh-error');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'eh-error';
    div.style.cssText = 'font-size:12px;font-weight:700;color:#b85c2a;margin-top:6px;';
    div.textContent = msg;
    container.appendChild(div);
    setTimeout(function () { div.remove(); }, 4000);
  }

  /* ── Override makeChips — no answer chips in confirm ────── */
  /* The original makeChips() exposes q.ans as clickable chips,
     letting students just tap the answer without thinking.
     We replace it with an empty array so the student must type. */
  window.makeChips = function () { return []; };

  /* ── Override handleAnswer — never reveal answer ─────────── */
  /* Original nudge[2] says "The answer is X!" — a full giveaway.
     After 3 wrong attempts we encourage the student to re-read
     the steps and try once more, then show Next Question.       */
  window.handleAnswer = function (text) {
    var q = window.session[window.idx];
    if (!q) return;

    var ok = q.ans.some(function (a) {
      var at = String(a).toLowerCase().trim();
      var tt = String(text).toLowerCase().trim();
      return tt.includes(at) || at.includes(tt);
    });

    var rb = document.getElementById('rbox');
    if (!rb) return;

    if (ok) {
      /* Correct — use page's own celebrate() */
      if (typeof window.celebrate === 'function') window.celebrate();
      return;
    }

    /* Wrong answer */
    window.nudgeCount = (window.nudgeCount || 0) + 1;
    rb.className = 'result-box no';
    rb.textContent = '\u2716 Not quite. Read my hint!';

    var nudgeEl = document.getElementById('nudgeBox');
    var nudgeMsg;

    if (window.nudgeCount <= 2) {
      /* Show nudge[0] or nudge[1] — these are real hints, not answers */
      nudgeMsg = q.nudges[window.nudgeCount - 1] || q.nudges[0];
    } else {
      /* 3rd+ wrong: encourage, never reveal */
      nudgeMsg = '\ud83d\udcda Scroll up and re-read the steps carefully. The answer is in there — you can do it!';
      /* Show Next Question button */
      var nb = document.getElementById('btnNext');
      if (nb) {
        nb.classList.add('show');
        nb.textContent = 'Move On \u25b6';
      }
    }

    if (nudgeEl) {
      nudgeEl.textContent = nudgeMsg;
      nudgeEl.classList.add('show');
    }
    if (typeof window.say === 'function') window.say(nudgeMsg);
    if (typeof window.rThink === 'function') window.rThink();
  };

})();
