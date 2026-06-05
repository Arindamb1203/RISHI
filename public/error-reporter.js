(function() {
  'use strict';

  if (window.location.pathname.startsWith('/admin')) return;

  /* Skip entirely on landing pages */
  if (window.location.pathname === '/landing' ||
      window.location.pathname.startsWith('/landing')) return;

  /* Editable name/phone inputs — register & payment (no localStorage yet) */
  var isEditableFields = window.location.pathname.indexOf('/register') !== -1;
  /* Simplified form (no question categories) — register, payment, parent, login */
  var isSimplifiedPage = isEditableFields ||
                         window.location.pathname.indexOf('/parent') !== -1 ||
                         window.location.pathname.indexOf('/login') !== -1;
  var isExamPage = window.location.pathname.indexOf('/exam') !== -1;

  function loadHtml2Canvas(cb) {
    if (window.html2canvas) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = cb;
    s.onerror = function() { cb(true); };
    document.head.appendChild(s);
  }

  if (!document.querySelector('link[href*="Orbitron"]')) {
    var lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Nunito:wght@400;700;800;900&display=swap';
    document.head.appendChild(lnk);
  }

  var css = `
  #rishi-float-btn {
    position:fixed;bottom:24px;right:20px;z-index:9999;
    display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;
  }
  #rishi-float-wrap { position:relative;width:90px; }
  #rishi-float-img {
    width:90px;height:auto;display:block;
    filter:drop-shadow(0 4px 12px rgba(200,146,42,.35));transition:transform .2s;
  }
  #rishi-float-btn:hover #rishi-float-img { transform:translateY(-3px); }
  #rishi-float-blink {
    position:absolute;top:28px;left:14px;width:62px;height:10px;
    background:#f0c8a0;border-radius:3px;opacity:0;pointer-events:none;
  }
  #rishi-float-dot {
    position:absolute;top:2px;left:2px;width:13px;height:13px;
    background:#e53935;border:2px solid #fff;border-radius:50%;
    animation:rishi-dot-pulse 1.6s ease-in-out infinite;
  }
  @keyframes rishi-dot-pulse {
    0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.55);}
    50%{box-shadow:0 0 0 5px rgba(229,57,53,0);}
  }
  #rishi-float-label {
    margin-top:5px;font-family:'Nunito',sans-serif;font-size:11px;
    font-weight:800;color:#8a7a5a;letter-spacing:.5px;text-align:center;
  }
  #rishi-report-overlay {
    display:none;position:fixed;bottom:130px;right:20px;z-index:10000;
    width:320px;background:#fdf6ec;border:1.5px solid #e0c97f;border-radius:12px;
    box-shadow:0 8px 40px rgba(180,130,60,.22);font-family:'Nunito',sans-serif;overflow:hidden;
  }
  #rishi-report-overlay.open { display:block; }
  .rishi-ov-head {
    background:linear-gradient(135deg,#fff8e8,#fef3cc);
    border-bottom:1.5px solid #e0c97f;padding:12px 16px;
    display:flex;align-items:center;gap:8px;justify-content:space-between;
  }
  .rishi-ov-title { font-family:'Orbitron',sans-serif;font-size:12px;font-weight:700;color:#7a5a00;letter-spacing:1px; }
  .rishi-ov-close { background:none;border:none;font-size:18px;cursor:pointer;color:#a08060;line-height:1;padding:2px 4px; }
  .rishi-ov-close:hover { color:#7a5a00; }
  .rishi-ov-body { padding:14px 16px; }
  .rishi-field { margin-bottom:10px; }
  .rishi-field label {
    display:block;font-size:10px;font-weight:900;text-transform:uppercase;
    letter-spacing:1px;color:#a08060;margin-bottom:3px;
  }
  .rishi-field .rishi-ro {
    font-size:12px;font-weight:700;color:#5a4a30;background:#fffcf0;
    border:1px solid #e8d9c0;border-radius:6px;padding:6px 10px;width:100%;
    box-sizing:border-box;
  }
  .rishi-field .rishi-input {
    background:#fff;border-color:#c8922a;cursor:text;outline:none;
    font-family:'Nunito',sans-serif;
  }
  .rishi-field .rishi-input:focus { border-color:#a06010;box-shadow:0 0 0 2px rgba(200,146,42,.18); }
  .rishi-cat-grid { display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px; }
  .rishi-cat-btn {
    padding:7px 6px;font-family:'Nunito',sans-serif;font-size:11px;font-weight:900;
    border:1.5px solid #e0c97f;border-radius:7px;background:#fffdf8;color:#7a5a00;
    cursor:pointer;text-align:center;transition:all .15s;line-height:1.3;
  }
  .rishi-cat-btn:hover { border-color:#c8922a;background:#fff8e8; }
  .rishi-cat-btn.selected { background:linear-gradient(135deg,#c8922a,#d4870a);border-color:#c8922a;color:#fff; }
  #rishi-desc-section { display:none; }
  #rishi-desc-section.visible { display:block; }
  .rishi-thumb-row { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
  #rishi-ss-thumb { width:56px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #e0c97f;display:none; }
  #rishi-ss-status { font-size:11px;font-weight:700;color:#a08060; }
  #rishi-desc {
    width:100%;min-height:70px;max-height:120px;resize:vertical;
    font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#3a2e1a;
    background:#fffdf8;border:1.5px solid #e0c97f;border-radius:6px;
    padding:8px 10px;outline:none;transition:border .2s;box-sizing:border-box;
  }
  #rishi-desc:focus { border-color:#c8922a; }
  #rishi-desc-err { font-size:11px;color:#c0392b;font-weight:700;display:none;margin-top:3px; }
  #rishi-submit-btn {
    width:100%;padding:10px;background:linear-gradient(135deg,#c8922a,#d4870a);
    border:none;border-radius:8px;font-family:'Orbitron',sans-serif;font-size:11px;
    font-weight:700;letter-spacing:1px;color:#fff;cursor:pointer;margin-top:12px;transition:all .2s;
  }
  #rishi-submit-btn:hover { transform:translateY(-1px);box-shadow:0 4px 16px rgba(200,146,42,.4); }
  #rishi-submit-btn:disabled { background:#ccc;cursor:not-allowed;transform:none;box-shadow:none; }

  /* Chat bubbles */
  .rishi-chat-bubble {
    background:#fff8e8;border:1.5px solid #e0c97f;border-radius:10px 10px 10px 3px;
    padding:10px 12px;margin-top:10px;font-size:12px;font-weight:700;color:#5a4a30;
    line-height:1.5;animation:bubbleIn .3s ease;
  }
  @keyframes bubbleIn { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;} }
  .rishi-chat-time { font-size:10px;color:#a08060;margin-top:4px; }

  /* Verified-correct bubble */
  .rishi-correct-bubble {
    background:#d4edda;border:1.5px solid #82c898;border-radius:10px;
    padding:10px 12px;margin-top:10px;font-size:12px;font-weight:800;color:#1a6b2a;
    line-height:1.5;animation:bubbleIn .3s ease;
  }

  /* Move to next button */
  #rishi-next-q-btn {
    width:100%;padding:10px;background:linear-gradient(135deg,#059669,#10b981);
    border:none;border-radius:8px;font-family:'Orbitron',sans-serif;font-size:11px;
    font-weight:700;letter-spacing:1px;color:#fff;cursor:pointer;margin-top:10px;transition:all .2s;display:none;
  }
  #rishi-next-q-btn.show { display:block; }
  #rishi-next-q-btn:hover { transform:translateY(-1px);box-shadow:0 4px 16px rgba(5,150,105,.4); }

  /* System-issue break button */
  #rishi-sysbreak-btn {
    margin-top:8px;padding:7px 14px;background:#c8922a;border:none;border-radius:20px;
    font-family:'Nunito',sans-serif;font-size:12px;font-weight:900;color:#fff;cursor:pointer;
  }

  .rishi-msg { font-size:13px;font-weight:800;text-align:center;padding:8px;border-radius:6px;margin-top:10px;display:none; }
  .rishi-msg.success { background:#d4edda;color:#1a6b2a;display:block; }
  .rishi-msg.error   { background:#fde8e8;color:#8b1a1a;display:block; }

  #rishi-fix-banner {
    position:fixed;top:0;left:0;right:0;z-index:99999;
    background:linear-gradient(135deg,#e8b84b,#c8922a);padding:12px 20px;
    display:none;align-items:center;justify-content:center;gap:16px;
    font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:#fff;
    box-shadow:0 2px 12px rgba(200,146,42,.4);
  }
  #rishi-fix-banner.show { display:flex; }
  #rishi-fix-refresh {
    padding:6px 18px;background:#fff;border:none;border-radius:20px;
    font-family:'Nunito',sans-serif;font-size:13px;font-weight:900;color:#c8922a;cursor:pointer;white-space:nowrap;
  }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* Fix banner */
  var banner = document.createElement('div');
  banner.id = 'rishi-fix-banner';
  banner.innerHTML = '&#10003; This issue has been fixed! Please refresh the page. <button id="rishi-fix-refresh" onclick="location.reload()">Refresh Now</button>';
  document.body.appendChild(banner);

  /* Float button */
  var floatBtn = document.createElement('div');
  floatBtn.id = 'rishi-float-btn';
  floatBtn.innerHTML =
    '<div id="rishi-float-wrap">' +
      '<img id="rishi-float-img" src="/images/rishika-float.png" alt="Rishika">' +
      '<div id="rishi-float-blink"></div>' +
      '<div id="rishi-float-dot"></div>' +
    '</div>' +
    '<div id="rishi-float-label">Report Issue</div>';
  document.body.appendChild(floatBtn);

  /* Category grid: hidden on register page, shown everywhere else */
  var catGridHtml = isSimplifiedPage ? '' :
    '<div class="rishi-cat-grid">' +
      '<button class="rishi-cat-btn" data-cat="Not in Syllabus" onclick="rishiSelectCat(this)">&#128218; Not in<br>Syllabus</button>' +
      '<button class="rishi-cat-btn" data-cat="Wrong Answer" onclick="rishiSelectCat(this)">&#10060; Wrong<br>Answer</button>' +
      '<button class="rishi-cat-btn" data-cat="Wrong Question/Answer" onclick="rishiSelectCat(this)">&#10067; Wrong<br>Question/Answer</button>' +
      '<button class="rishi-cat-btn" data-cat="Others" onclick="rishiSelectCat(this)">&#128172; Others</button>' +
    '</div>';

  /* Overlay */
  var overlay = document.createElement('div');
  overlay.id = 'rishi-report-overlay';
  overlay.innerHTML =
    '<div class="rishi-ov-head">' +
      '<span class="rishi-ov-title">&#129504; Report an Issue</span>' +
      '<button class="rishi-ov-close" id="rishi-ov-close">&#10005;</button>' +
    '</div>' +
    '<div class="rishi-ov-body" id="rishi-ov-body">' +
      (isEditableFields
        /* Register/payment: editable inputs */
        ? '<div class="rishi-field"><label>Your Name</label><input class="rishi-ro rishi-input" id="rishi-f-name" type="text" placeholder="Enter your name" autocomplete="name"></div>' +
          '<div class="rishi-field"><label>Mobile Number (10 digits)</label><input class="rishi-ro rishi-input" id="rishi-f-phone" type="tel" placeholder="10-digit mobile number" maxlength="10" inputmode="numeric" oninput="this.value=this.value.replace(/\\D/g,\'\').slice(0,10)" autocomplete="tel"></div>'
        /* Student/parent: auto-filled read-only */
        : '<div class="rishi-field"><label>Name</label><div class="rishi-ro" id="rishi-f-name">—</div></div>' +
          '<div class="rishi-field"><label>Class &amp; Board</label><div class="rishi-ro" id="rishi-f-class">—</div></div>' +
          '<div class="rishi-field"><label>Phone</label><div class="rishi-ro" id="rishi-f-phone">—</div></div>'
      ) +
      '<div class="rishi-field"><label>Page</label><div class="rishi-ro" id="rishi-f-page" style="font-size:10px;word-break:break-all;">—</div></div>' +
      (isSimplifiedPage
        ? '<div class="rishi-field"><label>What is the problem?</label></div>' +
          '<div id="rishi-desc-section" class="visible">' +
            '<div class="rishi-field">' +
              '<textarea id="rishi-desc" placeholder="Please describe the issue you are facing."></textarea>' +
              '<div id="rishi-desc-err">Please describe the issue before submitting.</div>' +
            '</div>' +
            '<button id="rishi-submit-btn" onclick="rishiSubmitReport()">&#9654; SEND REPORT</button>' +
          '</div>'
        : '<div class="rishi-field"><label>What is the issue?</label>' + catGridHtml + '</div>' +
          '<div id="rishi-desc-section">' +
            '<div class="rishi-thumb-row">' +
              '<img id="rishi-ss-thumb" src="" alt="screenshot">' +
              '<span id="rishi-ss-status">&#128247; Capturing screenshot...</span>' +
            '</div>' +
            '<div class="rishi-field">' +
              '<label id="rishi-desc-label">More details (optional)</label>' +
              '<textarea id="rishi-desc" placeholder="Any additional details? (optional)"></textarea>' +
              '<div id="rishi-desc-err">Please describe the issue before submitting.</div>' +
            '</div>' +
            '<button id="rishi-submit-btn" onclick="rishiSubmitReport()">&#9654; SEND REPORT</button>' +
          '</div>'
      ) +
      '<div id="rishi-chat-area"></div>' +
      '<button id="rishi-next-q-btn" onclick="rishiMoveToNextQ()">&#9654; Move to Next Question</button>' +
      '<div class="rishi-msg" id="rishi-msg"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* State */
  var screenshotB64 = '';
  var isParentPage = window.location.pathname.indexOf('/parent') !== -1;
  var isLoginPage = window.location.pathname.indexOf('/login') !== -1;
  var selectedCategory = isSimplifiedPage ? (isParentPage ? 'Parent Portal Issue' : isLoginPage ? 'Login Issue' : 'Registration Issue') : '';
  var pollTimer = null;
  var fiveMinTimer = null;
  var _submitted = false;

  /* Blink */
  var blinkEl = document.getElementById('rishi-float-blink');
  function scheduleBlink() {
    var d = 3000 + Math.random() * 2000;
    setTimeout(function() {
      blinkEl.style.transition = 'opacity 60ms'; blinkEl.style.opacity = '1';
      setTimeout(function() {
        blinkEl.style.transition = 'opacity 80ms'; blinkEl.style.opacity = '0';
        scheduleBlink();
      }, 120);
    }, d);
  }
  scheduleBlink();

  /* Category selection */
  window.rishiSelectCat = function(btn) {
    overlay.querySelectorAll('.rishi-cat-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    selectedCategory = btn.getAttribute('data-cat');
    var descSection = document.getElementById('rishi-desc-section');
    descSection.classList.add('visible');
    var lbl = document.getElementById('rishi-desc-label');
    var desc = document.getElementById('rishi-desc');
    if (selectedCategory === 'Others') {
      lbl.textContent = 'Describe the issue (required)';
      desc.placeholder = 'Please describe the issue in detail.';
    } else {
      lbl.textContent = 'More details (optional)';
      desc.placeholder = 'Any additional details? (optional)';
    }
  };

  /* Close — always works */
  document.getElementById('rishi-ov-close').addEventListener('click', function() {
    closeOverlay();
  });

  function closeOverlay() {
    overlay.classList.remove('open');
    if (fiveMinTimer) { clearTimeout(fiveMinTimer); fiveMinTimer = null; }
  }

  floatBtn.addEventListener('click', function() {
    if (overlay.classList.contains('open')) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  function openOverlay() {
    if (isEditableFields) {
      /* Register/payment: just set page URL; name/phone are user-typed inputs */
      document.getElementById('rishi-f-page').textContent = window.location.href;
    } else {
      /* Student/parent: auto-fill from rishi_current_student JSON */
      var cs = {};
      try { cs = JSON.parse(localStorage.getItem('rishi_current_student') || '{}'); } catch(e) {}
      var name  = cs.studentName || '—';
      var cls   = cs.class       || '—';
      var board = cs.board       || '';
      var phone = cs.phone || localStorage.getItem('rishi_phone') || localStorage.getItem('rishi_registered_phone') || '—';
      document.getElementById('rishi-f-name').textContent  = name;
      document.getElementById('rishi-f-class').textContent = 'Class ' + cls + ' \xB7 ' + (board ? board.toUpperCase() : '—');
      document.getElementById('rishi-f-phone').textContent = phone;
      document.getElementById('rishi-f-page').textContent  = window.location.href;
    }

    /* Reset */
    if (!isSimplifiedPage) { selectedCategory = ''; }
    _submitted = false;
    overlay.querySelectorAll('.rishi-cat-btn').forEach(function(b) { b.classList.remove('selected'); });
    if (!isSimplifiedPage) {
      document.getElementById('rishi-desc-section').classList.remove('visible');
    }
    document.getElementById('rishi-desc').value = '';
    document.getElementById('rishi-desc-err').style.display = 'none';
    document.getElementById('rishi-msg').className = 'rishi-msg';
    document.getElementById('rishi-msg').textContent = '';
    document.getElementById('rishi-submit-btn').disabled = false;
    document.getElementById('rishi-submit-btn').style.display = 'block';
    document.getElementById('rishi-submit-btn').innerHTML = '&#9654; SEND REPORT';
    document.getElementById('rishi-chat-area').innerHTML = '';
    document.getElementById('rishi-next-q-btn').className = 'next-btn';
    screenshotB64 = '';
    var thumbEl = document.getElementById('rishi-ss-thumb');
    var ssStatusEl = document.getElementById('rishi-ss-status');
    if (thumbEl) thumbEl.style.display = 'none';
    if (ssStatusEl) ssStatusEl.textContent = '📷 Capturing screenshot...';

    overlay.classList.add('open');

    if (!isSimplifiedPage) {
      loadHtml2Canvas(function(err) {
        if (err || !window.html2canvas) {
          if (ssStatusEl) ssStatusEl.textContent = 'Screenshot unavailable';
          return;
        }
        overlay.style.visibility = 'hidden';
        floatBtn.style.visibility = 'hidden';
        html2canvas(document.body, { useCORS: true, scale: 0.5, logging: false }).then(function(canvas) {
          overlay.style.visibility = '';
          floatBtn.style.visibility = '';
          screenshotB64 = canvas.toDataURL('image/png');
          if (thumbEl) { thumbEl.src = screenshotB64; thumbEl.style.display = 'block'; }
          if (ssStatusEl) ssStatusEl.textContent = '✓ Screenshot captured';
        }).catch(function() {
          overlay.style.visibility = '';
          floatBtn.style.visibility = '';
          if (ssStatusEl) ssStatusEl.textContent = 'Screenshot unavailable';
        });
      });
    }
  }

  function addChatBubble(text, extraHtml, isCorrect) {
    var area = document.getElementById('rishi-chat-area');
    var now = new Date();
    var t = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    var d = document.createElement('div');
    d.className = isCorrect ? 'rishi-correct-bubble' : 'rishi-chat-bubble';
    d.innerHTML = text + (extraHtml || '') + '<div class="rishi-chat-time">' + t + '</div>';
    area.appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* Move to next question */
  window.rishiMoveToNextQ = function() {
    closeOverlay();
  };

  /* ── EXAM AI VERIFICATION ────────────────────────────── */
  function runExamVerification(reportId) {
    var q = (window.allQ && window.currentIdx !== undefined) ? window.allQ[window.currentIdx] : null;
    var chInfo = window.CH_INFO || null;

    if (!q || !chInfo) {
      /* No question context — fall through to normal polling */
      addChatBubble('&#128640; We\'ve received your report. Our team is on it.');
      startPolling(reportId);
      return;
    }

    document.getElementById('rishi-chat-area').innerHTML =
      '<div style="font-size:12px;font-weight:700;color:#a08060;padding:8px 0;">&#128269; Checking this question...</div>';

    var payload = {
      reportId:     reportId,
      questionText: q.text || '',
      optionA:      q.a || '',
      optionB:      q.b || '',
      optionC:      q.c || '',
      optionD:      q.d || '',
      correctOption: q.correct || '',
      chapter:      chInfo.name || '',
      cls:          String(chInfo.cls || ''),
      board:        chInfo.board || 'cbse',
      reportType:   selectedCategory
    };

    fetch('/api/verify-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(vd) {
      document.getElementById('rishi-chat-area').innerHTML = '';

      if (vd.isCorrect) {
        /* Question is fine — student was mistaken */
        addChatBubble(
          '&#10003; We checked — this question and answer are correct.<br>' + (vd.plainReason || ''),
          '', true
        );
        /* Show a close button, no skip */
        var closeNote = document.createElement('div');
        closeNote.style.cssText = 'font-size:11px;color:#a08060;text-align:center;margin-top:8px;';
        closeNote.textContent = 'You can close this panel and continue the exam.';
        document.getElementById('rishi-chat-area').appendChild(closeNote);
      } else {
        /* Question has an issue — skip + replacement */
        addChatBubble(
          '&#128680; We found an issue with this question. ' + (vd.plainReason || '') +
          '<br>Moving you to the next question now.'
        );

        /* Add replacement question at end */
        if (vd.replacementQ && Array.isArray(window.allQ)) {
          window.allQ.push(Object.assign({}, vd.replacementQ, { section: 'A', marks: 1 }));
        }

        /* Skip after 1.5 s so student can read the message */
        setTimeout(function() {
          closeOverlay();
          if (typeof window.nextQuestion === 'function') {
            window.nextQuestion();
          }
        }, 1500);
      }
    })
    .catch(function() {
      document.getElementById('rishi-chat-area').innerHTML = '';
      addChatBubble('&#128640; We\'ve received your report. Our team will look into it shortly.');
      startPolling(reportId);
    });
  }

  /* Submit */
  window.rishiSubmitReport = function() {
    if (!selectedCategory) {
      showMsg('error', 'Please select an issue type first.');
      return;
    }
    var desc = document.getElementById('rishi-desc').value.trim();
    if (selectedCategory === 'Others' && !desc) {
      document.getElementById('rishi-desc-err').style.display = 'block';
      return;
    }
    document.getElementById('rishi-desc-err').style.display = 'none';

    var btn = document.getElementById('rishi-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var _cs = {};
    try { _cs = JSON.parse(localStorage.getItem('rishi_current_student') || '{}'); } catch(e) {}
    var payload = {
      name:        isEditableFields
                     ? (document.getElementById('rishi-f-name').value || '').trim()
                     : (_cs.studentName || ''),
      class:       _cs.class  || '',
      board:       _cs.board  || '',
      phone:       isEditableFields
                     ? (document.getElementById('rishi-f-phone').value || '').trim()
                     : (_cs.phone || localStorage.getItem('rishi_phone') || localStorage.getItem('rishi_registered_phone') || ''),
      pageURL:     window.location.href,
      pageName:    document.title,
      reportType:  selectedCategory,
      description: desc || selectedCategory,
      screenshot:  screenshotB64
    };

    fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success && data.reportId) {
        _submitted = true;
        sessionStorage.setItem('rishi_report_id', data.reportId);
        btn.innerHTML = '&#10003; Sent';
        btn.style.display = 'none';

        /* Hide form fields */
        document.getElementById('rishi-desc-section').classList.remove('visible');

        var isTagged = (selectedCategory === 'Not in Syllabus' ||
                        selectedCategory === 'Wrong Answer' ||
                        selectedCategory === 'Wrong Question/Answer');

        /* Exam page: run AI verification instead of normal flow */
        if (isExamPage && isTagged) {
          runExamVerification(data.reportId);
          return;
        }

        /* Practice / other pages: queue reorder event */
        if (isTagged) {
          window.dispatchEvent(new CustomEvent('rishi-report-submitted', {
            detail: { type: selectedCategory }
          }));
          document.getElementById('rishi-next-q-btn').className = 'next-btn show';
        }

        /* First chat bubble */
        addChatBubble('&#128640; We\'ve received your report. Our team is working on it. Please refresh after 5 minutes.');

        /* Start polling */
        startPolling(data.reportId);

        /* 5-minute second bubble */
        fiveMinTimer = setTimeout(function() {
          if (_submitted && pollTimer) {
            addChatBubble(
              '&#128336; We\'re still working on it. It may take a little more time. Please bear with us. Meanwhile, you can take a break.',
              '<button id="rishi-sysbreak-btn" onclick="rishiSysBreak()">&#9749; System Issue Break</button>'
            );
          }
        }, 5 * 60 * 1000);

      } else {
        showMsg('error', 'Could not send. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '&#9654; SEND REPORT';
      }
    })
    .catch(function() {
      showMsg('error', 'Could not send. Please try again.');
      btn.disabled = false;
      btn.innerHTML = '&#9654; SEND REPORT';
    });
  };

  /* System Issue break */
  window.rishiSysBreak = function() {
    closeOverlay();
    if (typeof window.startBreak === 'function') {
      window.startBreak('System Issue');
    }
  };

  function showMsg(type, text) {
    var el = document.getElementById('rishi-msg');
    el.textContent = text;
    el.className = 'rishi-msg ' + type;
  }

  /* Polling */
  function startPolling(reportId) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function() {
      fetch('/api/report-status?id=' + encodeURIComponent(reportId))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.status === 'fixed') {
            clearInterval(pollTimer);
            pollTimer = null;
            _submitted = false;
            if (fiveMinTimer) { clearTimeout(fiveMinTimer); fiveMinTimer = null; }
            sessionStorage.removeItem('rishi_report_id');
            document.getElementById('rishi-fix-banner').classList.add('show');
            closeOverlay();
          }
        })
        .catch(function() {});
    }, 30000);
  }

  var storedId = sessionStorage.getItem('rishi_report_id');
  if (storedId) startPolling(storedId);

  /* ── QUEUE REORDER (practice pages only) ──────────────────
     Placed here so it covers all practice pages across every
     class/board (rishi-core.js is absent on some pages).
  ──────────────────────────────────────────────────────────── */
  window.addEventListener('rishi-report-submitted', function() {
    if (window.location.pathname.indexOf('/practice/') === -1) return;
    if (!Array.isArray(window.QB) || window.QB.length === 0) return;
    if (typeof window.idx === 'undefined' || typeof window.loadQ !== 'function') return;

    var i = window.idx;
    if (i < 0 || i >= window.QB.length) return;

    var flagged = window.QB.splice(i, 1)[0];
    window.QB.push(flagged);

    if (Array.isArray(window.answered)) {
      window.answered.splice(i, 1);
      window.answered.push(null);
    }

    window.loadQ(i);
  });

})();
