/* ═══════════════════════════════════════════
   RISHI CHAT — rishi-chat.js
   Rishika AI chat box for exam.html
   Injects below score box in left panel.
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* Only run on exam page */
  if (window.location.pathname.indexOf('/exam') === -1) return;

  /* Inject styles */
  var css = `
  #rc-wrap {
    margin-top: 14px;
    border-top: 1px solid rgba(255,215,0,.15);
    padding-top: 12px;
  }
  #rc-toggle {
    width: 100%;
    padding: 8px 10px;
    background: rgba(255,215,0,.08);
    border: 1px solid rgba(255,215,0,.25);
    border-radius: 10px;
    color: #ffd700;
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background .2s;
  }
  #rc-toggle:hover { background: rgba(255,215,0,.14); }
  #rc-toggle .rc-arrow { font-size: 10px; transition: transform .2s; }
  #rc-toggle.open .rc-arrow { transform: rotate(180deg); }
  #rc-panel {
    display: none;
    margin-top: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,215,0,.18);
    border-radius: 10px;
    overflow: hidden;
  }
  #rc-panel.open { display: block; }
  #rc-limit {
    padding: 5px 10px;
    font-size: 10px;
    color: rgba(255,255,255,.45);
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    background: rgba(0,0,0,.2);
    border-bottom: 1px solid rgba(255,255,255,.06);
    text-align: right;
  }
  #rc-msgs {
    max-height: 180px;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,215,0,.2) transparent;
  }
  .rc-bubble {
    padding: 7px 10px;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    line-height: 1.45;
    max-width: 90%;
    word-break: break-word;
  }
  .rc-bubble.user {
    align-self: flex-end;
    background: rgba(255,215,0,.15);
    border: 1px solid rgba(255,215,0,.3);
    color: #ffd700;
  }
  .rc-bubble.rishika {
    align-self: flex-start;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.88);
  }
  .rc-bubble.rishika .rc-name {
    font-size: 9px;
    font-weight: 900;
    color: rgba(255,215,0,.6);
    letter-spacing: 1px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 3px;
  }
  .rc-thinking {
    align-self: flex-start;
    font-size: 11px;
    color: rgba(255,255,255,.35);
    font-family: 'Nunito', sans-serif;
    font-style: italic;
    padding: 4px 8px;
  }
  #rc-input-row {
    display: flex;
    gap: 5px;
    padding: 7px 8px;
    border-top: 1px solid rgba(255,255,255,.06);
    background: rgba(0,0,0,.15);
  }
  #rc-input {
    flex: 1;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 8px;
    padding: 6px 9px;
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    outline: none;
    transition: border .15s;
  }
  #rc-input:focus { border-color: rgba(255,215,0,.4); }
  #rc-input::placeholder { color: rgba(255,255,255,.3); font-weight: 600; }
  #rc-send {
    padding: 6px 10px;
    background: linear-gradient(135deg, #ffd700, #f39c12);
    border: none;
    border-radius: 8px;
    color: #1a1a2e;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: opacity .15s;
    flex-shrink: 0;
  }
  #rc-send:hover { opacity: .85; }
  #rc-send:disabled { background: rgba(255,255,255,.15); color: rgba(255,255,255,.3); cursor: not-allowed; }
  #rc-empty {
    padding: 10px 8px;
    text-align: center;
    font-size: 11px;
    color: rgba(255,255,255,.3);
    font-family: 'Nunito', sans-serif;
    line-height: 1.5;
  }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* State */
  var remaining = 20;
  var busy = false;

  /* Get student ID from localStorage */
  function getStudentId() {
    try {
      var cs = JSON.parse(localStorage.getItem('rishi_current_student') || '{}');
      return (cs.studentId || cs.studentUsername || cs.studentName || 'student').trim();
    } catch(e) { return 'student'; }
  }

  /* Get current question context from exam.html globals */
  function getContext() {
    var ctx = {};
    try {
      if (window.CH_INFO) {
        ctx.chapter = window.CH_INFO.name || '';
        ctx.topic   = window.CH_INFO.topic || '';
        ctx.class   = window.CH_INFO.cls || '8';
        ctx.board   = window.CH_INFO.board || 'CBSE';
      }
      if (Array.isArray(window.allQ) && typeof window.currentIdx !== 'undefined') {
        var q = window.allQ[window.currentIdx];
        if (q) {
          ctx.question = (q.q || '').replace(/<[^>]+>/g, '').trim();
          if (Array.isArray(q.opts)) ctx.options = q.opts;
        }
      }
    } catch(e) {}
    return ctx;
  }

  /* Inject HTML into left panel */
  function inject() {
    var scoreBox = document.querySelector('.score-box-big') || document.querySelector('.score-box');
    if (!scoreBox) return;

    var wrap = document.createElement('div');
    wrap.id = 'rc-wrap';
    wrap.innerHTML =
      '<button id="rc-toggle" onclick="rcToggle()">' +
        '<span>&#128172; Ask Rishika</span>' +
        '<span class="rc-arrow">&#9660;</span>' +
      '</button>' +
      '<div id="rc-panel">' +
        '<div id="rc-limit">20 questions left today</div>' +
        '<div id="rc-msgs">' +
          '<div id="rc-empty">&#128218; Ask me anything about this topic!<br>I won\'t give exam answers, but I\'ll explain concepts. &#127775;</div>' +
        '</div>' +
        '<div id="rc-input-row">' +
          '<input id="rc-input" type="text" placeholder="Ask a question..." maxlength="300" ' +
            'onkeydown="if(event.key===\'Enter\')rcSend()">' +
          '<button id="rc-send" onclick="rcSend()">&#10148;</button>' +
        '</div>' +
      '</div>';

    scoreBox.parentNode.insertBefore(wrap, scoreBox.nextSibling);
  }

  /* Toggle open/close */
  window.rcToggle = function() {
    var btn   = document.getElementById('rc-toggle');
    var panel = document.getElementById('rc-panel');
    if (!btn || !panel) return;
    var isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      btn.classList.remove('open');
    } else {
      panel.classList.add('open');
      btn.classList.add('open');
      var input = document.getElementById('rc-input');
      if (input) setTimeout(function() { input.focus(); }, 120);
    }
  };

  /* Add a bubble to the messages area */
  function addBubble(role, text) {
    var msgs = document.getElementById('rc-msgs');
    if (!msgs) return;
    var empty = document.getElementById('rc-empty');
    if (empty) { empty.parentNode.removeChild(empty); }

    var d = document.createElement('div');
    d.className = 'rc-bubble ' + role;
    if (role === 'rishika') {
      d.innerHTML = '<span class="rc-name">&#10024; Rishika</span>' + escHtml(text);
    } else {
      d.textContent = text;
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function updateLimit(n) {
    remaining = Math.max(0, n);
    var el = document.getElementById('rc-limit');
    if (el) el.textContent = remaining + ' question' + (remaining !== 1 ? 's' : '') + ' left today';
    if (remaining === 0) {
      var input = document.getElementById('rc-input');
      var send  = document.getElementById('rc-send');
      if (input) input.disabled = true;
      if (send)  send.disabled  = true;
    }
  }

  /* Send message */
  window.rcSend = function() {
    var input = document.getElementById('rc-input');
    if (!input) return;
    var msg = input.value.trim();
    if (!msg || busy) return;

    addBubble('user', msg);
    input.value = '';
    busy = true;

    var send = document.getElementById('rc-send');
    if (send) send.disabled = true;

    /* Thinking indicator */
    var msgs = document.getElementById('rc-msgs');
    var thinking = document.createElement('div');
    thinking.className = 'rc-thinking';
    thinking.id = 'rc-thinking';
    thinking.textContent = 'Rishika is thinking…';
    if (msgs) { msgs.appendChild(thinking); msgs.scrollTop = msgs.scrollHeight; }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: getStudentId(),
        message:   msg,
        context:   getContext()
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var t = document.getElementById('rc-thinking');
      if (t) t.parentNode.removeChild(t);
      addBubble('rishika', data.reply || 'Sorry, I had trouble replying. Try again!');
      if (typeof data.remaining === 'number') updateLimit(data.remaining);
    })
    .catch(function() {
      var t = document.getElementById('rc-thinking');
      if (t) t.parentNode.removeChild(t);
      addBubble('rishika', 'Sorry, something went wrong. Please try again.');
    })
    .finally(function() {
      busy = false;
      var s = document.getElementById('rc-send');
      if (s && remaining > 0) s.disabled = false;
    });
  };

  /* Wait for DOM + exam page to fully init before injecting */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    /* Use a small delay so exam.html's own init() runs first and left panel is visible */
    setTimeout(inject, 500);
  }

})();
