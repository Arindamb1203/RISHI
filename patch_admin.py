"""
patch_admin.py — Run from D:\rishi>
python patch_admin.py

Fixes:
  1. Card buttons: removes Seed, adds solid green View button
  2. Bulk ops: removes Seed All to KV
  3. Global class bar (Class 6/7/8/9) below nav tabs
  4. Topic Exams: per-class + Sampurna Pariksha
  5. Questions tab: syncs to global class
"""

import re, sys, os

PATH = os.path.join('public', 'admin', 'admin.html')

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

original = html
changes  = []

# ── HELPER ───────────────────────────────────────────────────────────────────
def replace_once(old, new, label):
    global html
    if old in html:
        html = html.replace(old, new, 1)
        changes.append('OK: ' + label)
    else:
        changes.append('SKIP (not found): ' + label)

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1: Card buttons — remove Seed, add solid green View
# Works on both old patterns (with or without View button)
# ─────────────────────────────────────────────────────────────────────────────
CORRECT_BUTTONS = (
    "'<div style=\"display:flex;gap:6px;\">' +\n"
    "        '<button id=\"qb-gen-btn-' + ch.id + '\" onclick=\"qbGenerateChapter(\\'' + ch.id + '\\')\" "
    "style=\"flex:2;padding:7px 4px;border:none;border-radius:7px;font-size:13px;font-weight:800;"
    "cursor:pointer;background:rgba(124,58,237,.15);color:#7c3aed;font-family:Outfit,sans-serif;\">✨ Generate</button>' +\n"
    "        '<button id=\"qb-prev-btn-' + ch.id + '\" onclick=\"qbPreviewChapter(\\'' + ch.id + '\\')\" "
    "style=\"flex:1;padding:7px 4px;border:none;border-radius:7px;font-size:13px;font-weight:800;"
    "cursor:pointer;background:#1a7a4a;color:#fff;font-family:Outfit,sans-serif;\">👁 View</button>' +\n"
    "        '<button onclick=\"qbDeleteChapter(\\'' + ch.id + '\\')\" "
    "style=\"padding:7px 10px;border:none;border-radius:7px;font-size:13px;cursor:pointer;"
    "background:rgba(192,57,43,.08);color:var(--red);font-family:Outfit,sans-serif;\">🗑</button>'"
)

# Pattern A: has Seed button + old View (display:none)
old_A = re.search(
    r"'<div style=\"display:flex;gap:6px;\">.*?'<button onclick=\"qbDeleteChapter.*?'>🗑</button>'",
    html, re.DOTALL
)
if old_A:
    html = html.replace(old_A.group(0), CORRECT_BUTTONS, 1)
    changes.append('OK: Card buttons fixed (Seed removed, View added solid green)')
else:
    changes.append('SKIP: Card button pattern not matched — check manually')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: Bulk ops — remove Seed All to KV button
# ─────────────────────────────────────────────────────────────────────────────
replace_once(
    "          <button class=\"btn btn-ghost\" id=\"qb-seed-all-btn\" onclick=\"qbSeedAll()\">⬆ Seed All to KV</button>\n",
    "",
    "Bulk ops: Seed All removed"
)

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3: CSS for global class bar
# ─────────────────────────────────────────────────────────────────────────────
CSS_ADD = """
/* ── GLOBAL CLASS BAR ── */
.admin-class-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:10px 20px;background:#fff;border-bottom:2px solid var(--border);}
.admin-class-tab{font-size:14px;font-weight:800;padding:6px 18px;border-radius:20px;
  border:2px solid var(--border);background:#fff;color:var(--muted);
  transition:all .15s;cursor:pointer;}
.admin-class-tab:hover{border-color:var(--gold);color:var(--text);}
.admin-class-tab.on{background:var(--gold);border-color:var(--gold);color:#fff;}
"""
replace_once(
    '.hidden{display:none!important;}',
    '.hidden{display:none!important;}' + CSS_ADD,
    "CSS: global class bar"
)

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4: Global class bar HTML between tabs and wrap
# ─────────────────────────────────────────────────────────────────────────────
CLASS_BAR_HTML = """
  <!-- ══ GLOBAL CLASS SELECTOR ══ -->
  <div class="admin-class-bar" id="admin-class-bar">
    <span style="font-size:13px;font-weight:800;color:var(--muted);margin-right:4px;">Class:</span>
    <button class="admin-class-tab" data-cls="6" onclick="switchAdminClass(6)">Class 6</button>
    <button class="admin-class-tab" data-cls="7" onclick="switchAdminClass(7)">Class 7</button>
    <button class="admin-class-tab on" data-cls="8" onclick="switchAdminClass(8)">Class 8</button>
    <button class="admin-class-tab" data-cls="9" onclick="switchAdminClass(9)">Class 9</button>
  </div>
"""
if 'admin-class-bar' not in html:
    replace_once(
        '  <div class="wrap">',
        CLASS_BAR_HTML + '  <div class="wrap">',
        "HTML: global class bar"
    )
else:
    changes.append('SKIP: Global class bar already present')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 5: Remove Questions-tab own class selector (already done if patch ran before)
# ─────────────────────────────────────────────────────────────────────────────
before = len(html)
html = re.sub(
    r'      <!-- Class selector -->\s*<div[^>]*id="qb-class-tabs"[^>]*>.*?</div>\s*\n',
    '', html, flags=re.DOTALL
)
if len(html) != before:
    changes.append('OK: Questions tab own class selector removed')
else:
    changes.append('SKIP: QB class tabs already removed or not found')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 6: activeAdminClass + switchAdminClass() JS
# ─────────────────────────────────────────────────────────────────────────────
GLOBAL_CLASS_JS = """
var activeAdminClass = 8;

function switchAdminClass(cls) {
  activeAdminClass = cls;
  loadAdminClassData(cls);
  qbActiveClass = cls;
  qbBankCache   = {};
  var g = document.getElementById('qb-chapter-grid');
  if (g) g.innerHTML = '';
  var lbl = document.getElementById('qb-class-label');
  if (lbl) lbl.textContent = 'Class ' + cls;
  document.querySelectorAll('.admin-class-tab').forEach(function(b) {
    b.classList.toggle('on', parseInt(b.dataset.cls) === cls);
  });
  refresh();
}
"""
if 'switchAdminClass' not in html:
    replace_once(
        "var ADMIN_PASS = 'rishi2025';",
        "var ADMIN_PASS = 'rishi2025';" + GLOBAL_CLASS_JS,
        "JS: activeAdminClass + switchAdminClass()"
    )
else:
    changes.append('SKIP: switchAdminClass already present')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 7: TOPIC_EXAMS_BY_CLASS + SAMPURNA_BY_CLASS
# ─────────────────────────────────────────────────────────────────────────────
NEW_TOPIC_DATA = """var TOPIC_EXAMS_BY_CLASS = {
  6: [
    {id:'t6-arithmetic', name:'Arithmetic',   icon:'🔢', chs:[1,3,5,7,10], url:null},
    {id:'t6-geometry',   name:'Geometry',     icon:'📐', chs:[2,8,9],       url:null},
    {id:'t6-mensuration',name:'Mensuration',  icon:'📏', chs:[6],           url:null},
    {id:'t6-data',       name:'Data Handling',icon:'📊', chs:[4],           url:null},
  ],
  7: [
    {id:'t7-arithmetic', name:'Arithmetic',   icon:'🔢', chs:[1,2,3,6,8],  url:null},
    {id:'t7-algebra',    name:'Algebra',      icon:'🔣', chs:[4],           url:null},
    {id:'t7-geometry',   name:'Geometry',     icon:'📐', chs:[5,7],         url:null},
  ],
  8: [
    {id:'algebra',      name:'Algebra',       icon:'🔣', chs:[2,9,14,15],   url:'/topic-exam.html?topic=algebra'},
    {id:'geometry',     name:'Geometry',      icon:'📐', chs:[3,4,10],      url:'/topic-exam.html?topic=geometry'},
    {id:'mensuration',  name:'Mensuration',   icon:'📏', chs:[11,112],      url:'/topic-exam.html?topic=mensuration'},
    {id:'arithmetic',   name:'Arithmetic',    icon:'🔢', chs:[1,8,12,13,16],url:'/topic-exam.html?topic=arithmetic'},
    {id:'datahandling', name:'Data Handling', icon:'📊', chs:[5,17],        url:'/topic-exam.html?topic=datahandling'},
  ],
  9: [
    {id:'t9-algebra',      name:'Algebra',      icon:'🔣', chs:[2,3],       url:null},
    {id:'t9-geometry',     name:'Geometry',     icon:'📐', chs:[5,6,7,8,9], url:null},
    {id:'t9-mensuration',  name:'Mensuration',  icon:'📏', chs:[10,11],     url:null},
    {id:'t9-data',         name:'Data Handling',icon:'📊', chs:[12],        url:null},
  ]
};

var SAMPURNA_BY_CLASS = {
  6: null,
  7: null,
  8: '/sampurna-pariksha.html',
  9: null
};"""

if 'TOPIC_EXAMS_BY_CLASS' not in html:
    old_tl = re.search(r'var TOPIC_EXAM_LIST = \[.*?\];', html, re.DOTALL)
    if old_tl:
        html = html.replace(old_tl.group(0), NEW_TOPIC_DATA, 1)
        changes.append('OK: TOPIC_EXAMS_BY_CLASS + SAMPURNA_BY_CLASS added')
    else:
        changes.append('SKIP: TOPIC_EXAM_LIST not found')
else:
    changes.append('SKIP: TOPIC_EXAMS_BY_CLASS already present')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 8: buildTopics() with Sampurna
# ─────────────────────────────────────────────────────────────────────────────
NEW_BUILD_TOPICS = """function buildTopics() {
  var examList    = TOPIC_EXAMS_BY_CLASS[activeAdminClass] || [];
  var sampurnaUrl = SAMPURNA_BY_CLASS[activeAdminClass]    || null;
  var html = '';

  for (var i = 0; i < examList.length; i++) {
    var t        = examList[i];
    var done     = isTopicExamDone(t.id);
    var score    = localStorage.getItem('rishi_topicexam_score_'    + t.id) || '—';
    var attempts = localStorage.getItem('rishi_topicexam_attempts_' + t.id) || '0';
    var built    = !!t.url;
    html += '<div class="card" style="margin-bottom:0;">';
    html += '<div class="card-ttl">' + t.icon + ' ' + t.name + '</div>';
    html += '<div style="font-size:15px;color:var(--muted);margin-bottom:10px;">'
          + t.chs.length + ' chapters &nbsp;&middot;&nbsp; ';
    if (!built) {
      html += '<span style="color:var(--dim);font-weight:700;">Coming Soon</span>';
    } else {
      html += 'Status: <span style="color:' + (done ? 'var(--green)' : 'var(--amber)')
            + ';font-weight:700;">' + (done ? '&#10003; Done' : 'Not taken') + '</span>';
      if (done) html += ' &nbsp;&middot;&nbsp; Best: ' + score + '/60 &nbsp;&middot;&nbsp; Attempts: ' + attempts;
    }
    html += '</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
    if (built) {
      html += '<button class="btn btn-gold" onclick="openTopicExam(\\'' + t.id + '\\',\\'' + t.url + '\\')">&#128203; Open Topic Exam</button>';
      if (done) html += '<button class="btn btn-danger" onclick="resetTopicExam(\\'' + t.id + '\\')">&#8635; Reset</button>';
    } else {
      html += '<button class="btn btn-ghost" disabled style="opacity:.5;">&#128203; Coming Soon</button>';
    }
    html += '</div></div>';
  }

  /* Sampurna Pariksha */
  html += '<div class="card" style="margin-bottom:0;border-left:5px solid var(--gold);">';
  html += '<div class="card-ttl">&#127942; Sampurna Pariksha — Grand Final Exam</div>';
  if (!sampurnaUrl) {
    html += '<div style="font-size:15px;color:var(--dim);font-weight:700;margin-bottom:10px;">Coming Soon for Class ' + activeAdminClass + '</div>';
    html += '<button class="btn btn-ghost" disabled style="opacity:.5;">&#127942; Coming Soon</button>';
  } else {
    var spDone  = localStorage.getItem('rishi_sampurna_done')  === '1';
    var spScore = localStorage.getItem('rishi_sampurna_score') || '—';
    html += '<div style="font-size:15px;color:var(--muted);margin-bottom:10px;">50 questions &nbsp;&middot;&nbsp; All chapters &nbsp;&middot;&nbsp; Status: '
          + '<span style="color:' + (spDone ? 'var(--green)' : 'var(--amber)') + ';font-weight:700;">'
          + (spDone ? '&#10003; Done' : 'Not taken') + '</span>';
    if (spDone) html += ' &nbsp;&middot;&nbsp; Score: ' + spScore + '/50';
    html += '</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-gold" onclick="window.open(\\'' + sampurnaUrl + '\\',\\'_blank\\')">&#127942; Open Sampurna Pariksha</button>';
    if (spDone) html += '<button class="btn btn-danger" onclick="resetSampurna()">&#8635; Reset</button>';
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('topics-grid').innerHTML = html;
}

function openTopicExam(tid, url) { window.open(url, '_blank'); }

function resetSampurna() {
  if (!confirm('Reset Sampurna Pariksha?')) return;
  localStorage.removeItem('rishi_sampurna_done');
  localStorage.removeItem('rishi_sampurna_score');
  buildTopics();
  showToast('Sampurna Pariksha reset.');
}"""

if 'SAMPURNA_BY_CLASS' in html and 'resetSampurna' not in html:
    old_bt = re.search(r'function buildTopics\(\) \{.*?\n\}', html, re.DOTALL)
    if old_bt:
        html = html.replace(old_bt.group(0), NEW_BUILD_TOPICS, 1)
        # Remove old single-arg openTopicExam
        html = re.sub(
            r"function openTopicExam\(tid\) \{\s*window\.open\(['\"].*?['\"].*?\}\s*\n",
            '', html, flags=re.DOTALL
        )
        changes.append('OK: buildTopics() rebuilt with Sampurna')
    else:
        changes.append('SKIP: buildTopics() not found')
else:
    changes.append('SKIP: buildTopics already updated or TOPIC_EXAMS_BY_CLASS missing')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 9: buildQuestionsTab — sync with global class
# ─────────────────────────────────────────────────────────────────────────────
NEW_BQT = """function buildQuestionsTab() {
  if (qbActiveClass !== activeAdminClass) {
    qbActiveClass = activeAdminClass;
    qbBankCache   = {};
    var g = document.getElementById('qb-chapter-grid');
    if (g) g.innerHTML = '';
    var lbl = document.getElementById('qb-class-label');
    if (lbl) lbl.textContent = 'Class ' + activeAdminClass;
  }
  var grid = document.getElementById('qb-chapter-grid');
  if (grid && grid.children.length === 0) qbBuildGrid();
}"""

old_bqt = re.search(r'function buildQuestionsTab\(\) \{.*?\n\}', html, re.DOTALL)
if old_bqt and 'activeAdminClass' not in old_bqt.group(0):
    html = html.replace(old_bqt.group(0), NEW_BQT, 1)
    changes.append('OK: buildQuestionsTab synced to global class')
else:
    changes.append('SKIP: buildQuestionsTab already synced')

# ─────────────────────────────────────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────────────────────────────────────
if html == original:
    print("WARNING: No changes made. File may already be up to date.")
else:
    with open(PATH, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Saved:", PATH)
    print("Lines:", html.count('\n'))

print("\nChanges:")
for c in changes:
    print(" ", c)

print("\nRun:")
print("  git add .")
print('  git commit -m "Fix View btn, remove Seed, global class tabs, Sampurna in Topic Exams"')
print("  git push")
