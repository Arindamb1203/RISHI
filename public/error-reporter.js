(function() {
  'use strict';

  /* ── Don't load on admin panel ── */
  if (window.location.pathname.startsWith('/admin')) return;

  /* ── Load html2canvas from CDN if not present ── */
  function loadHtml2Canvas(cb) {
    if (window.html2canvas) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = cb;
    s.onerror = function() { cb(true); };
    document.head.appendChild(s);
  }

  /* ── Ensure Google Fonts ── */
  if (!document.querySelector('link[href*="Orbitron"]')) {
    var lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Nunito:wght@400;700;800;900&display=swap';
    document.head.appendChild(lnk);
  }

  /* ── CSS ── */
  var css = `
  #rishi-float-btn {
    position: fixed;
    bottom: 24px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  #rishi-float-wrap {
    position: relative;
    width: 90px;
  }
  #rishi-float-img {
    width: 90px;
    height: auto;
    display: block;
    filter: drop-shadow(0 4px 12px rgba(200,146,42,.35));
    transition: transform .2s;
  }
  #rishi-float-btn:hover #rishi-float-img { transform: translateY(-3px); }
  #rishi-float-blink {
    position: absolute;
    top: 28px;
    left: 14px;
    width: 62px;
    height: 10px;
    background: #f0c8a0;
    border-radius: 3px;
    opacity: 0;
    pointer-events: none;
  }
  #rishi-float-dot {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 13px;
    height: 13px;
    background: #e53935;
    border: 2px solid #fff;
    border-radius: 50%;
    animation: rishi-dot-pulse 1.6s ease-in-out infinite;
  }
  @keyframes rishi-dot-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(229,57,53,.55); }
    50%      { box-shadow: 0 0 0 5px rgba(229,57,53,0); }
  }
  #rishi-float-label {
    margin-top: 5px;
    font-family: 'Nunito', sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: #8a7a5a;
    letter-spacing: .5px;
    text-align: center;
  }

  /* ── Overlay ── */
  #rishi-report-overlay {
    display: none;
    position: fixed;
    bottom: 130px;
    right: 20px;
    z-index: 10000;
    width: 320px;
    background: #fdf6ec;
    border: 1.5px solid #e0c97f;
    border-radius: 12px;
    box-shadow: 0 8px 40px rgba(180,130,60,.22);
    font-family: 'Nunito', sans-serif;
    overflow: hidden;
  }
  #rishi-report-overlay.open { display: block; }

  .rishi-ov-head {
    background: linear-gradient(135deg, #fff8e8, #fef3cc);
    border-bottom: 1.5px solid #e0c97f;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }
  .rishi-ov-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #7a5a00;
    letter-spacing: 1px;
  }
  .rishi-ov-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #a08060;
    line-height: 1;
    padding: 2px 4px;
  }
  .rishi-ov-close:hover { color: #7a5a00; }

  .rishi-ov-body { padding: 14px 16px; }

  .rishi-field { margin-bottom: 10px; }
  .rishi-field label {
    display: block;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #a08060;
    margin-bottom: 3px;
  }
  .rishi-field .rishi-ro {
    font-size: 12px;
    font-weight: 700;
    color: #5a4a30;
    background: #fffcf0;
    border: 1px solid #e8d9c0;
    border-radius: 6px;
    padding: 6px 10px;
    width: 100%;
  }

  /* ── Category buttons ── */
  .rishi-cat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
  }
  .rishi-cat-btn {
    padding: 7px 6px;
    font-family: 'Nunito', sans-serif;
    font-size: 11px;
    font-weight: 900;
    border: 1.5px solid #e0c97f;
    border-radius: 7px;
    background: #fffdf8;
    color: #7a5a00;
    cursor: pointer;
    text-align: center;
    transition: all .15s;
    line-height: 1.3;
  }
  .rishi-cat-btn:hover { border-color: #c8922a; background: #fff8e8; }
  .rishi-cat-btn.selected {
    background: linear-gradient(135deg, #c8922a, #d4870a);
    border-color: #c8922a;
    color: #fff;
  }

  /* ── Description (hidden until category selected) ── */
  #rishi-desc-section { display: none; }
  #rishi-desc-section.visible { display: block; }

  .rishi-thumb-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  #rishi-ss-thumb {
    width: 56px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e0c97f;
    display: none;
  }
  #rishi-ss-status {
    font-size: 11px;
    font-weight: 700;
    color: #a08060;
  }

  #rishi-desc {
    width: 100%;
    min-height: 70px;
    max-height: 120px;
    resize: vertical;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #3a2e1a;
    background: #fffdf8;
    border: 1.5px solid #e0c97f;
    border-radius: 6px;
    padding: 8px 10px;
    outline: none;
    transition: border .2s;
    box-sizing: border-box;
  }
  #rishi-desc:focus { border-color: #c8922a; }
  #rishi-desc-err {
    font-size: 11px;
    color: #c0392b;
    font-weight: 700;
    display: none;
    margin-top: 3px;
  }

  #rishi-submit-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #c8922a, #d4870a);
    border: none;
    border-radius: 8px;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #fff;
    cursor: pointer;
    margin-top: 12px;
    transition: all .2s;
  }
  #rishi-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,146,42,.4); }
  #rishi-submit-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

  .rishi-msg {
    font-size: 13px;
    font-weight: 800;
    text-align: center;
    padding: 8px;
    border-radius: 6px;
    margin-top: 10px;
    display: none;
  }
  .rishi-msg.success { background: #d4edda; color: #1a6b2a; display: block; }
  .rishi-msg.error   { background: #fde8e8; color: #8b1a1a; display: block; }

  /* ── Fix banner ── */
  #rishi-fix-banner {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 99999;
    background: linear-gradient(135deg, #e8b84b, #c8922a);
    padding: 12px 20px;
    display: none;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 2px 12px rgba(200,146,42,.4);
  }
  #rishi-fix-banner.show { display: flex; }
  #rishi-fix-refresh {
    padding: 6px 18px;
    background: #fff;
    border: none;
    border-radius: 20px;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: #c8922a;
    cursor: pointer;
    white-space: nowrap;
  }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Fix banner DOM ── */
  var banner = document.createElement('div');
  banner.id = 'rishi-fix-banner';
  banner.innerHTML = '✅ This issue has been fixed! Please refresh the page. <button id="rishi-fix-refresh" onclick="location.reload()">Refresh Now</button>';
  document.body.appendChild(banner);

  /* ── Float button DOM ── */
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

  /* ── Overlay DOM ── */
  var overlay = document.createElement('div');
  overlay.id = 'rishi-report-overlay';
  overlay.innerHTML =
    '<div class="rishi-ov-head">' +
      '<span class="rishi-ov-title">&#129504; Report an Issue</span>' +
      '<button class="rishi-ov-close" id="rishi-ov-close">&#10005;</button>' +
    '</div>' +
    '<div class="rishi-ov-body" id="rishi-ov-body">' +
      '<div class="rishi-field"><label>Name</label><div class="rishi-ro" id="rishi-f-name">—</div></div>' +
      '<div class="rishi-field"><label>Class &amp; Board</label><div class="rishi-ro" id="rishi-f-class">—</div></div>' +
      '<div class="rishi-field"><label>Phone</label><div class="rishi-ro" id="rishi-f-phone">—</div></div>' +
      '<div class="rishi-field"><label>Page</label><div class="rishi-ro" id="rishi-f-page" style="font-size:10px;word-break:break-all;">—</div></div>' +
      '<div class="rishi-field"><label>What is the issue?</label>' +
        '<div class="rishi-cat-grid">' +
          '<button class="rishi-cat-btn" data-cat="Not in Syllabus" onclick="rishiSelectCat(this)">📚 Not in<br>Syllabus</button>' +
          '<button class="rishi-cat-btn" data-cat="Wrong Answer" onclick="rishiSelectCat(this)">❌ Wrong<br>Answer</button>' +
          '<button class="rishi-cat-btn" data-cat="Wrong Question" onclick="rishiSelectCat(this)">❓ Wrong<br>Question</button>' +
          '<button class="rishi-cat-btn" data-cat="Others" onclick="rishiSelectCat(this)">💬 Others</button>' +
        '</div>' +
      '</div>' +
      '<div id="rishi-desc-section">' +
        '<div class="rishi-thumb-row">' +
          '<img id="rishi-ss-thumb" src="" alt="screenshot">' +
          '<span id="rishi-ss-status">&#128247; Capturing screenshot...</span>' +
        '</div>' +
        '<div class="rishi-field">' +
          '<label>More details (optional for tagged issues)</label>' +
          '<textarea id="rishi-desc" placeholder="What went wrong? What did you expect?"></textarea>' +
          '<div id="rishi-desc-err">Please describe the issue before submitting.</div>' +
        '</div>' +
        '<button id="rishi-submit-btn" onclick="rishiSubmitReport()">&#9654; SEND REPORT</button>' +
      '</div>' +
      '<div class="rishi-msg" id="rishi-msg"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* ── State ── */
  var screenshotB64 = '';
  var selectedCategory = '';
  var pollTimer = null;

  /* ── Blink animation ── */
  var blinkEl = document.getElementById('rishi-float-blink');
  function scheduleBlink() {
    var delay = 3000 + Math.random() * 2000;
    setTimeout(function() {
      blinkEl.style.transition = 'opacity 60ms';
      blinkEl.style.opacity = '1';
      setTimeout(function() {
        blinkEl.style.transition = 'opacity 80ms';
        blinkEl.style.opacity = '0';
        scheduleBlink();
      }, 120);
    }, delay);
  }
  scheduleBlink();

  /* ── Category selection ── */
  window.rishiSelectCat = function(btn) {
    var btns = overlay.querySelectorAll('.rishi-cat-btn');
    btns.forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    selectedCategory = btn.getAttribute('data-cat');

    var descSection = document.getElementById('rishi-desc-section');
    descSection.classList.add('visible');

    /* For "Others" — description is required; for others it's optional */
    var desc = document.getElementById('rishi-desc');
    if (selectedCategory === 'Others') {
      desc.placeholder = 'Please describe the issue in detail.';
    } else {
      desc.placeholder = 'Any additional details? (optional)';
    }
  };

  /* ── Toggle overlay ── */
  floatBtn.addEventListener('click', function() {
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open');
    } else {
      openOverlay();
    }
  });
  document.getElementById('rishi-ov-close').addEventListener('click', function() {
    overlay.classList.remove('open');
  });

  function openOverlay() {
    var name  = localStorage.getItem('rishi_student_name') || '—';
    var cls   = localStorage.getItem('rishi_class') || '—';
    var board = localStorage.getItem('rishi_board') || '—';
    var phone = localStorage.getItem('rishi_phone') || localStorage.getItem('rishi_registered_phone') || '—';

    document.getElementById('rishi-f-name').textContent  = name;
    document.getElementById('rishi-f-class').textContent = 'Class ' + cls + ' · ' + board.toUpperCase();
    document.getElementById('rishi-f-phone').textContent = phone;
    document.getElementById('rishi-f-page').textContent  = window.location.href;

    /* Reset */
    selectedCategory = '';
    overlay.querySelectorAll('.rishi-cat-btn').forEach(function(b) { b.classList.remove('selected'); });
    document.getElementById('rishi-desc-section').classList.remove('visible');
    document.getElementById('rishi-desc').value = '';
    document.getElementById('rishi-desc-err').style.display = 'none';
    document.getElementById('rishi-msg').className = 'rishi-msg';
    document.getElementById('rishi-msg').textContent = '';
    document.getElementById('rishi-submit-btn').disabled = false;
    document.getElementById('rishi-submit-btn').textContent = '▶ SEND REPORT';

    screenshotB64 = '';
    document.getElementById('rishi-ss-thumb').style.display = 'none';
    document.getElementById('rishi-ss-status').textContent = '📷 Capturing screenshot...';

    overlay.classList.add('open');

    /* Capture screenshot */
    loadHtml2Canvas(function(err) {
      if (err || !window.html2canvas) {
        document.getElementById('rishi-ss-status').textContent = 'Screenshot unavailable';
        return;
      }
      overlay.style.visibility = 'hidden';
      floatBtn.style.visibility = 'hidden';
      html2canvas(document.body, { useCORS: true, scale: 0.5, logging: false }).then(function(canvas) {
        overlay.style.visibility = '';
        floatBtn.style.visibility = '';
        screenshotB64 = canvas.toDataURL('image/png');
        var thumb = document.getElementById('rishi-ss-thumb');
        thumb.src = screenshotB64;
        thumb.style.display = 'block';
        document.getElementById('rishi-ss-status').textContent = '✓ Screenshot captured';
      }).catch(function() {
        overlay.style.visibility = '';
        floatBtn.style.visibility = '';
        document.getElementById('rishi-ss-status').textContent = 'Screenshot unavailable';
      });
    });
  }

  /* ── Submit ── */
  window.rishiSubmitReport = function() {
    if (!selectedCategory) {
      showMsg('error', 'Please select an issue type first.');
      return;
    }
    var desc = document.getElementById('rishi-desc').value.trim();
    /* Description required only for "Others" */
    if (selectedCategory === 'Others' && !desc) {
      document.getElementById('rishi-desc-err').style.display = 'block';
      return;
    }
    document.getElementById('rishi-desc-err').style.display = 'none';

    var btn = document.getElementById('rishi-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var payload = {
      name:        localStorage.getItem('rishi_student_name') || '',
      class:       localStorage.getItem('rishi_class') || '',
      board:       localStorage.getItem('rishi_board') || '',
      phone:       localStorage.getItem('rishi_phone') || localStorage.getItem('rishi_registered_phone') || '',
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
        sessionStorage.setItem('rishi_report_id', data.reportId);
        showMsg('success', '✅ Thank you! We\'re looking into it.');
        btn.textContent = '✓ Sent';
        startPolling(data.reportId);
      } else {
        showMsg('error', 'Could not send. Please try again.');
        btn.disabled = false;
        btn.textContent = '▶ SEND REPORT';
      }
    })
    .catch(function() {
      showMsg('error', 'Could not send. Please try again.');
      btn.disabled = false;
      btn.textContent = '▶ SEND REPORT';
    });
  };

  function showMsg(type, text) {
    var el = document.getElementById('rishi-msg');
    el.textContent = text;
    el.className = 'rishi-msg ' + type;
  }

  /* ── Polling for fix status ── */
  function startPolling(reportId) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function() {
      fetch('/api/report-status?id=' + encodeURIComponent(reportId))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.status === 'fixed') {
            clearInterval(pollTimer);
            pollTimer = null;
            sessionStorage.removeItem('rishi_report_id');
            document.getElementById('rishi-fix-banner').classList.add('show');
            overlay.classList.remove('open');
          }
        })
        .catch(function() {});
    }, 30000);
  }

  var storedId = sessionStorage.getItem('rishi_report_id');
  if (storedId) startPolling(storedId);

})();
