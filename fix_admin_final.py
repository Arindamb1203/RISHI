"""
fix_admin_final.py — Run from D:\rishi>
python fix_admin_final.py
"""
import re, os

PATH = os.path.join('public', 'admin', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add global class bar CSS
html = html.replace(
    '.hidden{display:none!important;}',
    '''.hidden{display:none!important;}
.admin-class-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 20px;background:#fff;border-bottom:2px solid var(--border);}
.admin-class-tab{font-size:14px;font-weight:800;padding:6px 18px;border-radius:20px;border:2px solid var(--border);background:#fff;color:var(--muted);transition:all .15s;cursor:pointer;}
.admin-class-tab:hover{border-color:var(--gold);color:var(--text);}
.admin-class-tab.on{background:var(--gold);border-color:var(--gold);color:#fff;}''', 1)

# 2. Add global class bar HTML before wrap div
html = html.replace(
    '  <div class="wrap">',
    '''  <div class="admin-class-bar" id="admin-class-bar">
    <span style="font-size:13px;font-weight:800;color:var(--muted);margin-right:4px;">Class:</span>
    <button class="admin-class-tab" data-cls="6" onclick="switchAdminClass(6)">Class 6</button>
    <button class="admin-class-tab" data-cls="7" onclick="switchAdminClass(7)">Class 7</button>
    <button class="admin-class-tab on" data-cls="8" onclick="switchAdminClass(8)">Class 8</button>
    <button class="admin-class-tab" data-cls="9" onclick="switchAdminClass(9)">Class 9</button>
  </div>
  <div class="wrap">''', 1)

# 3. Remove Questions tab own class selector
html = re.sub(
    r'\s*<!-- Class selector -->\s*<div[^>]+id="qb-class-tabs"[^>]*>.*?</div>',
    '', html, flags=re.DOTALL)

# 4. Add activeAdminClass + switchAdminClass after ADMIN_PASS
html = html.replace(
    "var ADMIN_PASS = 'rishi2025';",
    """var ADMIN_PASS = 'rishi2025';
var activeAdminClass = 8;
function switchAdminClass(cls) {
  activeAdminClass = cls;
  loadAdminClassData(cls);
  qbActiveClass = cls; qbBankCache = {};
  var g = document.getElementById('qb-chapter-grid');
  if (g) g.innerHTML = '';
  var lbl = document.getElementById('qb-class-label');
  if (lbl) lbl.textContent = 'Class ' + cls;
  document.querySelectorAll('.admin-class-tab').forEach(function(b){
    b.classList.toggle('on', parseInt(b.dataset.cls) === cls);
  });
  refresh();
}""", 1)

# 5. Replace TOPIC_EXAM_LIST with per-class data + Sampurna
old_tel = re.search(r'var TOPIC_EXAM_LIST = \[.*?\];', html, re.DOTALL)
if old_tel:
    html = html.replace(old_tel.group(0), """var TOPIC_EXAMS_BY_CLASS = {
  6:[
    {id:'t6-arithmetic',name:'Arithmetic',  icon:'🔢',chs:[1,3,5,7,10],url:null},
    {id:'t6-geometry',  name:'Geometry',    icon:'📐',chs:[2,8,9],      url:null},
    {id:'t6-mensuration',name:'Mensuration',icon:'📏',chs:[6],          url:null},
  ],
  7:[
    {id:'t7-arithmetic',name:'Arithmetic',  icon:'🔢',chs:[1,2,3,6,8], url:null},
    {id:'t7-algebra',   name:'Algebra',     icon:'🔣',chs:[4],          url:null},
    {id:'t7-geometry',  name:'Geometry',    icon:'📐',chs:[5,7],        url:null},
  ],
  8:[
    {id:'algebra',     name:'Algebra',      icon:'🔣',chs:[2,9,14,15],  url:'/topic-exam.html?topic=algebra'},
    {id:'geometry',    name:'Geometry',     icon:'📐',chs:[3,4,10],     url:'/topic-exam.html?topic=geometry'},
    {id:'mensuration', name:'Mensuration',  icon:'📏',chs:[11,112],     url:'/topic-exam.html?topic=mensuration'},
    {id:'arithmetic',  name:'Arithmetic',   icon:'🔢',chs:[1,8,12,13,16],url:'/topic-exam.html?topic=arithmetic'},
    {id:'datahandling',name:'Data Handling',icon:'📊',chs:[5,17],       url:'/topic-exam.html?topic=datahandling'},
  ],
  9:[
    {id:'t9-algebra',    name:'Algebra',      icon:'🔣',chs:[2,3],      url:null},
    {id:'t9-geometry',   name:'Geometry',     icon:'📐',chs:[5,6,7,8,9],url:null},
    {id:'t9-mensuration',name:'Mensuration',  icon:'📏',chs:[10,11],    url:null},
    {id:'t9-data',       name:'Data Handling',icon:'📊',chs:[12],       url:null},
  ]
};
var SAMPURNA_BY_CLASS = {6:null,7:null,8:'/sampurna-pariksha.html',9:null};""", 1)

# 6. Replace buildTopics()
old_bt = re.search(r'function buildTopics\(\) \{.*?\n\}', html, re.DOTALL)
if old_bt:
    html = html.replace(old_bt.group(0), """function buildTopics() {
  var examList = TOPIC_EXAMS_BY_CLASS[activeAdminClass] || [];
  var sampurnaUrl = SAMPURNA_BY_CLASS[activeAdminClass] || null;
  var html = '';
  for (var i = 0; i < examList.length; i++) {
    var t = examList[i]; var built = !!t.url;
    var done = isTopicExamDone(t.id);
    var score = localStorage.getItem('rishi_topicexam_score_' + t.id) || '—';
    var attempts = localStorage.getItem('rishi_topicexam_attempts_' + t.id) || '0';
    html += '<div class="card" style="margin-bottom:0;"><div class="card-ttl">' + t.icon + ' ' + t.name + '</div>';
    html += '<div style="font-size:15px;color:var(--muted);margin-bottom:10px;">' + t.chs.length + ' chapters &nbsp;&middot;&nbsp; ';
    if (!built) { html += '<span style="color:var(--dim);font-weight:700;">Coming Soon</span>'; }
    else {
      html += 'Status: <span style="color:' + (done?'var(--green)':'var(--amber)') + ';font-weight:700;">' + (done?'&#10003; Done':'Not taken') + '</span>';
      if (done) html += ' &nbsp;&middot;&nbsp; Best: ' + score + '/60 &nbsp;&middot;&nbsp; Attempts: ' + attempts;
    }
    html += '</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
    if (built) {
      html += '<button class="btn btn-gold" onclick="openTopicExam(\\'' + t.id + '\\',\\'' + t.url + '\\')">&#128203; Open Topic Exam</button>';
      if (done) html += '<button class="btn btn-danger" onclick="resetTopicExam(\\'' + t.id + '\\')">&#8635; Reset</button>';
    } else { html += '<button class="btn btn-ghost" disabled style="opacity:.5;">&#128203; Coming Soon</button>'; }
    html += '</div></div>';
  }
  html += '<div class="card" style="margin-bottom:0;border-left:5px solid var(--gold);"><div class="card-ttl">&#127942; Sampurna Pariksha — Grand Final Exam</div>';
  if (!sampurnaUrl) {
    html += '<div style="font-size:15px;color:var(--dim);font-weight:700;margin-bottom:10px;">Coming Soon for Class ' + activeAdminClass + '</div>';
    html += '<button class="btn btn-ghost" disabled style="opacity:.5;">&#127942; Coming Soon</button>';
  } else {
    var spDone = localStorage.getItem('rishi_sampurna_done') === '1';
    var spScore = localStorage.getItem('rishi_sampurna_score') || '—';
    html += '<div style="font-size:15px;color:var(--muted);margin-bottom:10px;">50 questions &nbsp;&middot;&nbsp; All chapters &nbsp;&middot;&nbsp; Status: <span style="color:' + (spDone?'var(--green)':'var(--amber)') + ';font-weight:700;">' + (spDone?'&#10003; Done':'Not taken') + '</span>';
    if (spDone) html += ' &nbsp;&middot;&nbsp; Score: ' + spScore + '/50';
    html += '</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-gold" onclick="window.open(\\'' + sampurnaUrl + '\\',\\'_blank\\')">&#127942; Open Sampurna Pariksha</button>';
    if (spDone) html += '<button class="btn btn-danger" onclick="resetSampurna()">&#8635; Reset</button>';
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('topics-grid').innerHTML = html;
}
function openTopicExam(tid,url){window.open(url,'_blank');}
function resetSampurna(){
  if(!confirm('Reset Sampurna Pariksha?'))return;
  localStorage.removeItem('rishi_sampurna_done');
  localStorage.removeItem('rishi_sampurna_score');
  buildTopics(); showToast('Sampurna Pariksha reset.');
}""", 1)

# 7. Remove old single-arg openTopicExam
html = re.sub(r"function openTopicExam\(tid\)\s*\{[^}]+\}\s*\n", '', html)

# 8. Update buildQuestionsTab to sync with global
html = html.replace(
    """function buildQuestionsTab() {
  var grid = document.getElementById('qb-chapter-grid');
  if (grid && grid.children.length === 0) qbBuildGrid();
}""",
    """function buildQuestionsTab() {
  if (qbActiveClass !== activeAdminClass) {
    qbActiveClass = activeAdminClass; qbBankCache = {};
    var g = document.getElementById('qb-chapter-grid');
    if (g) g.innerHTML = '';
    var lbl = document.getElementById('qb-class-label');
    if (lbl) lbl.textContent = 'Class ' + activeAdminClass;
  }
  var grid = document.getElementById('qb-chapter-grid');
  if (grid && grid.children.length === 0) qbBuildGrid();
}""", 1)

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(html)
print("Done.")
print("  git add .")
print('  git commit -m "Global class tabs, Sampurna, View button fixed"')
print("  git push")
