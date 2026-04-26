/**
 * explain-helper.js — RISHI "Explain Differently" engine
 * Include on all 16 explain pages with: <script src="/explain-helper.js"></script>
 *
 * What it does:
 *   After Rekha finishes all steps and shows "✅ I Understand!", a
 *   "🤔 Explain Differently" button appears below it.
 *   Clicking it calls /api/explain-differently (Gemini) and re-teaches
 *   the same concept using a fresh story, analogy, or worked example.
 *
 * Assumptions (true for all 16 explain pages):
 *   - window.session[window.idx] has .q (question text) and .steps (array of {t:...})
 *   - #qArea is the main content div
 *   - .topbar-center has the chapter name text
 *   - .step / .step-num / .step-body CSS classes already exist on the page
 */

(function() {
  'use strict';

  /* ── Wait for DOM ──────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    /* Watch #qArea for the "I Understand!" button being added */
    var qArea = document.getElementById('qArea');
    if (!qArea) {
      /* qArea may not exist yet at DOMContentLoaded — retry */
      setTimeout(boot, 400);
      return;
    }
    var obs = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          checkForUnderstandBtn(added[j]);
        }
      }
    });
    obs.observe(qArea, { childList: true, subtree: true });
  }

  /* ── Detect "I Understand!" button ────────────────────── */
  function checkForUnderstandBtn(node) {
    if (node.nodeType !== 1) return;
    /* Direct match */
    if (isUnderstandBtn(node)) { injectDifferentlyBtn(node); return; }
    /* Search descendants */
    var btns = node.querySelectorAll ? node.querySelectorAll('button') : [];
    for (var i = 0; i < btns.length; i++) {
      if (isUnderstandBtn(btns[i])) { injectDifferentlyBtn(btns[i]); return; }
    }
  }

  function isUnderstandBtn(el) {
    return el.tagName === 'BUTTON' && el.innerHTML && el.innerHTML.indexOf('I Understand') !== -1;
  }

  /* ── Inject the "Explain Differently" button ───────────── */
  function injectDifferentlyBtn(understandBtn) {
    /* Avoid double-injection */
    var parent = understandBtn.parentNode;
    if (!parent || parent.querySelector('.btn-explain-differently')) return;

    var btn = document.createElement('button');
    btn.className = 'btn-speak btn-explain-differently';
    btn.innerHTML = '&#129300; Explain Differently';
    btn.style.cssText = 'margin-top:10px;width:100%;background:linear-gradient(135deg,#7a4aaa,#a06aee);color:#fff;border-color:#7a4aaa;';
    btn.onclick = function() { handleExplainDifferently(btn); };
    parent.appendChild(btn);

    /* Scroll so button is visible */
    setTimeout(function() {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }

  /* ── Main handler ──────────────────────────────────────── */
  function handleExplainDifferently(triggerBtn) {
    /* Disable to prevent double-click */
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = '&#8987; Thinking differently...';

    /* Gather context from page globals */
    var concept  = '';
    var origSteps = [];
    try {
      var q = window.session[window.idx];
      concept    = q.q  || q.question || '';
      origSteps  = q.steps || [];
    } catch(e) {}

    /* Chapter name from topbar */
    var chapter = 'Mathematics';
    var tc = document.querySelector('.topbar-center');
    if (tc) {
      chapter = tc.textContent.trim().replace(/^[^\w]+/, '').trim() || chapter;
    }

    /* Call API */
    fetch('/api/explain-differently', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept:  concept,
        chapter:  chapter,
        steps:    origSteps
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (!data.steps || !data.steps.length) throw new Error('No steps returned');
      triggerBtn.style.display = 'none';
      renderFreshExplanation(data.steps, triggerBtn.parentNode);
    })
    .catch(function(err) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = '&#129300; Explain Differently';
      showInlineError(triggerBtn.parentNode, 'Couldn\'t reach Gemini. Try again in a moment.');
    });
  }

  /* ── Render the new explanation ────────────────────────── */
  function renderFreshExplanation(steps, container) {
    /* Find or create the qArea to append to */
    var qArea = document.getElementById('qArea');
    if (!qArea) qArea = container;

    var card = document.createElement('div');
    card.className = 'q-card';
    card.style.cssText = 'border-color:#7a4aaa;';
    card.innerHTML =
      '<div class="q-label" style="color:#7a4aaa;">' +
        '&#129760; A Different Way to Think About It' +
      '</div>' +
      '<div id="diffStepsWrap"></div>';
    qArea.appendChild(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var wrap = card.querySelector('#diffStepsWrap');
    var delay = 300;

    for (var i = 0; i < steps.length; i++) {
      (function(stepText, stepNum, d) {
        /* Determine display number and style */
        var isAnswer = /^Answer:/i.test(stepText);
        var label    = isAnswer ? '&#10003;' : String(stepNum);
        var numStyle = isAnswer
          ? 'background:linear-gradient(135deg,#5a8a60,#7ab87a);'
          : 'background:linear-gradient(135deg,#7a4aaa,#a06aee);';

        var div = document.createElement('div');
        div.className = 'step';
        div.innerHTML =
          '<div class="step-num" style="' + numStyle + 'border:2px solid #4a2a7a;">' + label + '</div>' +
          '<div class="step-body">' + escHtml(stepText) + '</div>';
        wrap.appendChild(div);

        setTimeout(function() {
          div.classList.add('vis');
          /* Speak each step if say() is available */
          if (typeof window.say === 'function') {
            var plain = stepText.replace(/^Step\s*\d+:\s*/i, '').replace(/^Answer:\s*/i, '');
            window.say(plain);
          }
        }, d);
      })(steps[i], i + 1, delay);

      delay += isAnswerStep(steps[i]) ? 400 : 3200;
    }

    /* After all steps: show "Got it!" button */
    setTimeout(function() {
      var gotit = document.createElement('button');
      gotit.className = 'btn-speak';
      gotit.innerHTML = '&#9989; Got it now!';
      gotit.style.cssText = 'margin-top:14px;width:100%;';
      gotit.onclick = function() {
        gotit.remove();
        /* Restore "I Understand!" button behaviour — find and click it */
        var iu = findUnderstandBtn();
        if (iu && !iu.disabled) { iu.click(); }
      };
      wrap.appendChild(gotit);
      gotit.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, delay + 400);
  }

  /* ── Helpers ───────────────────────────────────────────── */
  function isAnswerStep(text) {
    return /^Answer:/i.test(text);
  }

  function findUnderstandBtn() {
    var btns = document.querySelectorAll('#qArea button');
    for (var i = 0; i < btns.length; i++) {
      if (isUnderstandBtn(btns[i])) return btns[i];
    }
    return null;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showInlineError(container, msg) {
    var old = container.querySelector('.eh-error');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'eh-error';
    div.style.cssText = 'font-size:12px;font-weight:700;color:#b85c2a;margin-top:6px;';
    div.textContent = msg;
    container.appendChild(div);
    setTimeout(function() { div.remove(); }, 4000);
  }

})();
