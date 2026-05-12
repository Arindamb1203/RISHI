"""
fix_admin_dashboard.py — Run from D:\rishi>
"""
import os, re

PATH = os.path.join('public', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

errors = []

# ── 1. Update Live Stats items ──
OLD_STATS = """  var items = [
    {n: s.explainDone  + '/16', l:'Explain Done',    c:'var(--blue2)'},
    {n: s.practiceDone + '/16', l:'Practice Done',   c:'var(--green2)'},
    {n: s.examDone     + '/16', l:'Exam Done',        c:'var(--gold)'},
    {n: s.totalSessions,        l:'Total Sessions',   c:'var(--text)'},
    {n: s.activeChapters,       l:'Active Chapters',  c:'var(--amber)'},
    {n: s.plans,                l:'Study Plans',       c:'var(--muted)'},
    {n: s.breaks,               l:'Break Sessions',   c:'var(--muted)'}
  ];"""

NEW_STATS = """  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations') || '[]'); } catch(e) {}
  var totalReg = regs.length;
  var totalRevenue = 0;
  regs.forEach(function(r){
    if (r.subscriptionStatus === 'subscribed') totalRevenue += 599;
    else if (r.subscriptionStatus === 'trial') totalRevenue += 0;
  });
  // Online/offline based on rishi_presence_online timestamp (last 5 min = online)
  var now = Math.floor(Date.now() / 1000);
  var online = 0, offline = 0;
  regs.forEach(function(r){
    var sid = (r.studentUsername || r.studentId || '').toLowerCase();
    var lastSeen = parseInt(localStorage.getItem('rishi_presence_online_' + sid) || '0', 10);
    if (lastSeen && (now - lastSeen) < 300) online++; else offline++;
  });
  var items = [
    {n: totalReg,            l:'Registered',          c:'var(--gold)'},
    {n: online,              l:'Online Now',          c:'var(--green)'},
    {n: offline,             l:'Offline',             c:'var(--muted)'},
    {n: '₹' + totalRevenue,  l:'Revenue Earned',      c:'var(--amber)'},
    {n: '—',                 l:'Successful Referrals',c:'var(--dim)'}
  ];"""

if OLD_STATS in h:
    h = h.replace(OLD_STATS, NEW_STATS, 1)
    print("Live Stats updated")
else:
    errors.append("Live Stats pattern MISS")

# ── 2. Remove unnecessary Quick Actions buttons ──
# Find Quick Actions block
m = re.search(r'<div class="card-ttl"[^>]*>⚡ Quick Actions</div>.*?</div>\s*<div class="section-note">', h, re.DOTALL)
if m:
    NEW_QA = '''<div class="card-ttl" style="margin-bottom:10px;">⚡ Quick Actions</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="switchTab('tree')">→ Open Chapter Tree</button>
          <button class="btn btn-ghost" onclick="window.open('/login.html','_blank')">🔐 Student Login</button>
        </div>
        <div class="section-note">'''
    h = h.replace(m.group(0), NEW_QA, 1)
    print("Quick Actions cleaned up")
else:
    errors.append("Quick Actions MISS")

# Remove the note about Reset/Clear since buttons are gone
h = re.sub(
    r'⚠ Reset All Progress clears every explain/practice/exam done flag.*?disables all chapter access for the student\.',
    '⚡ Use Open Chapter Tree to access any page directly. Enable BYPASS to skip flow locks.',
    h, flags=re.DOTALL
)

# ── 3. Rewrite renderStudentRows with exact column spec ──
m2 = re.search(r'function renderStudentRows\(regs\) \{.*?^\}', h, re.DOTALL | re.MULTILINE)
if m2:
    NEW_FN = '''function renderStudentRows(regs) {
  var con = document.getElementById('dash-students');
  if(!regs || !regs.length) {
    con.innerHTML = '<div class="empty"><div class="empty-ico">👤</div>No students found.<br><small>Click "Load Test Data" above to populate.</small></div>';
    return;
  }
  var allRegs = window._allRegs || regs;
  var bypassParam = sessionStorage.getItem('rishi_admin_bypass') === '1' ? '?bypass=1' : '';

  var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Outfit,sans-serif;min-width:900px;">';
  html += '<thead><tr style="background:var(--s2);border-bottom:2px solid var(--border);">';
  ['Student ID','Parent ID','Phone','Explain','Practice','Chapter Exam','Topic Exam','Sampurna','Reference'].forEach(function(h){
    html += '<th style="text-align:left;padding:10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;white-space:nowrap;">' + h + '</th>';
  });
  html += '</tr></thead><tbody>';

  regs.forEach(function(r) {
    var idx = allRegs.indexOf(r);
    var sId    = r.studentUsername || r.studentId || '—';
    var pId    = r.parentUsername || r.parentId || '—';
    var mobile = r.primaryMobile || '—';
    var cls    = r.class || '8';
    var sName  = r.studentName || sId;

    // Build URL helpers — each clickable button sets current_student then opens page
    function studentURL(path) {
      return path + (path.indexOf('?')>=0?'&':'?') + 'bypass=1';
    }

    html += '<tr style="border-bottom:1px solid var(--border);" onmouseover="this.style.background=\\'var(--s2)\\'" onmouseout="this.style.background=\\'\\'">';
    // Student ID — clickable, opens syllabus
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/syllabus.html\\')" style="background:none;border:none;color:#7c3aed;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;text-decoration:underline;padding:0;">' + esc(sId) + '</button><br><small style="color:var(--dim);">' + esc(sName) + '</small></td>';
    // Parent ID — clickable, opens parent dashboard
    html += '<td style="padding:8px 10px;"><button onclick="goParent(' + idx + ')" style="background:none;border:none;color:#0f2240;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;text-decoration:underline;padding:0;">' + esc(pId) + '</button></td>';
    // Phone — no action
    html += '<td style="padding:8px 10px;color:var(--muted);">' + esc(mobile) + '</td>';
    // Explain — opens syllabus (Explain section)
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/syllabus.html#explain\\')" style="padding:5px 10px;border:1.5px solid #7c3aed;background:#fff;color:#7c3aed;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Open</button></td>';
    // Practice
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/syllabus.html#practice\\')" style="padding:5px 10px;border:1.5px solid #0891b2;background:#fff;color:#0891b2;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Open</button></td>';
    // Chapter Exam
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/syllabus.html#exam\\')" style="padding:5px 10px;border:1.5px solid #c8922a;background:#fff;color:#c8922a;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Open</button></td>';
    // Topic Exam (defaults to algebra for current class)
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/topic-exam.html?topic=algebra&class=' + cls + '\\')" style="padding:5px 10px;border:1.5px solid #1a7a4a;background:#fff;color:#1a7a4a;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Open</button></td>';
    // Sampurna
    html += '<td style="padding:8px 10px;"><button onclick="openAsStudent(' + idx + ',\\'/sampurna-pariksha.html?class=' + cls + '\\')" style="padding:5px 10px;border:1.5px solid #c0392b;background:#fff;color:#c0392b;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Open</button></td>';
    // Reference — placeholder
    html += '<td style="padding:8px 10px;"><button onclick="alert(\\'Reference feature coming soon\\')" style="padding:5px 10px;border:1.5px solid #888;background:#fff;color:#888;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;">Ref</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  con.innerHTML = html;
}

/* Open any path as if logged in as this student (sets current_student + bypass) */
function openAsStudent(idx, path) {
  var regs = window._allRegs || [];
  var r = regs[idx];
  if (!r) return;
  var st = {
    studentName: r.studentName || 'Student',
    studentId: r.studentUsername || r.studentId || '—',
    studentUsername: r.studentUsername || r.studentId || '—',
    parentUsername: r.parentUsername || '—',
    board: r.board || 'CBSE',
    class: r.class || '8',
    role: 'student'
  };
  localStorage.setItem('rishi_current_student', JSON.stringify(st));
  sessionStorage.setItem('rishi_admin_bypass', '1');
  loadAdminClassData(parseInt(r.class || 8));
  var sep = path.indexOf('?') >= 0 ? '&' : '?';
  var url = path + (path.indexOf('?')>=0 ? '&' : '?') + 'bypass=1';
  // If path has hash, place bypass before hash
  if (path.indexOf('#') >= 0) {
    var hashIdx = path.indexOf('#');
    var base = path.substring(0, hashIdx);
    var hash = path.substring(hashIdx);
    var bsep = base.indexOf('?') >= 0 ? '&' : '?';
    url = base + bsep + 'bypass=1' + hash;
  }
  window.open(url, '_blank');
}'''
    h = h.replace(m2.group(0), NEW_FN, 1)
    print("renderStudentRows rewritten with exact column spec")
else:
    errors.append("renderStudentRows MISS")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print()
if errors:
    print("ERRORS:")
    for e in errors: print(" -", e)
else:
    print("All applied.")
print()
print("git add .")
print('git commit -m "Admin dashboard: new stats, table columns, remove unused Quick Actions"')
print("git push")
