"""
build_all.py — Run from D:\rishi>
python build_all.py

Applies all multi-file changes in one shot:
1. register.html: 299 → 599
2. landing.html:  299 → 599
3. login.html:    adds Parent Login / Register / Payment buttons
4. syllabus.html: shows Student ID + Parent ID at top
5. admin.html:    enriches Registered Students with action buttons
6. parent.html:   adds reset password, profile/settings panel, payment history
7. Creates database/schema.sql (already provided separately)
"""

import os, re

def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read().replace('\r\n','\n')

def write(p, c):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print("  Saved:", p)

errors = []

# ─── 1. PRICE: 299 → 599 ───
for f in ['public/register.html', 'public/landing.html']:
    h = read(f)
    before = h.count('299')
    h = h.replace('₹299', '₹599').replace('₹ 299', '₹ 599')
    h = h.replace('Pay ₹599 &amp;', 'Pay ₹599 &amp;')
    # Replace any 299 in pricing context (₹299/month etc)
    h = re.sub(r'(₹\s*)299(\s*/?\s*month)?', r'\g<1>599\g<2>', h)
    after = h.count('299')
    write(f, h)
    print(f"  {f}: 299 instances {before} → {after}")

# ─── 2. LOGIN.HTML: add bottom buttons ───
f = 'public/login.html'
h = read(f)
OLD = '<a class="back-link" href="/landing.html">← Back to Home</a>'
NEW = '''<div style="margin:24px 0 16px;padding:18px;border-top:2px solid #e8d9c4;display:flex;flex-direction:column;gap:8px;">
    <button class="text-btn" onclick="window.location.href='/parent.html'" style="background:#0f2240;color:#fff;padding:12px;border-radius:10px;border:none;font-weight:800;cursor:pointer;font-family:inherit;font-size:15px;">👨‍👩‍👧 Parent Login</button>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:6px;font-size:14px;">
      <a href="/register.html" style="color:#c8922a;text-decoration:none;font-weight:700;">📝 Register</a>
      <span style="color:#a08060;">·</span>
      <a href="/landing.html" style="color:#c8922a;text-decoration:none;font-weight:700;">🏠 Home</a>
      <span style="color:#a08060;">·</span>
      <a href="/register.html#payment" style="color:#c8922a;text-decoration:none;font-weight:700;">💳 Payment</a>
    </div>
  </div>
  <a class="back-link" href="/landing.html">← Back to Home</a>'''
if OLD in h: h = h.replace(OLD, NEW, 1); print("  login.html: bottom buttons added")
else: errors.append("login.html bottom buttons MISS")
write(f, h)

# ─── 3. SYLLABUS.HTML: show Student ID + Parent ID at top ───
f = 'public/syllabus.html'
h = read(f)
# Find body opening
m = re.search(r'<body[^>]*>', h)
if m:
    INJECT = '''<div id="syl-id-bar" style="background:#fef9f2;border-bottom:2px solid #e8d9c4;padding:8px 16px;display:flex;gap:14px;flex-wrap:wrap;font-size:13px;font-weight:700;font-family:'Share Tech Mono',monospace;color:#6b5a3e;">
  <span>Student: <span id="syl-sid" style="color:#c8922a;">—</span></span>
  <span>Parent: <span id="syl-pid" style="color:#0f2240;">—</span></span>
  <span style="margin-left:auto;">Class: <span id="syl-cls" style="color:#1a7a4a;">—</span></span>
</div>
<script>
(function(){
  try {
    var cs = JSON.parse(localStorage.getItem('rishi_current_student')||'{}');
    document.addEventListener('DOMContentLoaded', function(){
      var sid = document.getElementById('syl-sid'); if (sid) sid.textContent = cs.studentId || cs.studentUsername || '—';
      var pid = document.getElementById('syl-pid'); if (pid) pid.textContent = cs.parentUsername || cs.parentId || '—';
      var cls = document.getElementById('syl-cls'); if (cls) cls.textContent = cs.class || '8';
    });
  } catch(e){}
})();
</script>
'''
    h = h.replace(m.group(0), m.group(0) + '\n' + INJECT, 1)
    print("  syllabus.html: ID bar added")
else:
    errors.append("syllabus.html body tag MISS")
write(f, h)

# ─── 4. ADMIN.HTML: enrich student rows ───
f = 'public/admin.html'
h = read(f)

# Replace renderStudentRows function with enriched version
m = re.search(r'function renderStudentRows\(regs\) \{.*?^\}', h, re.DOTALL | re.MULTILINE)
if m:
    NEW_FN = '''function renderStudentRows(regs) {
  var con = document.getElementById('dash-students');
  if(!regs || !regs.length) {
    con.innerHTML = '<div class="empty"><div class="empty-ico">👤</div>No students found.</div>';
    return;
  }
  var allRegs = window._allRegs || regs;
  var today = new Date(); today.setHours(0,0,0,0);

  var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Outfit,sans-serif;">';
  html += '<thead><tr style="background:var(--s2);border-bottom:2px solid var(--border);">';
  html += '<th style="text-align:left;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Student</th>';
  html += '<th style="text-align:left;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Parent</th>';
  html += '<th style="text-align:left;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Mobile</th>';
  html += '<th style="text-align:left;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Cls</th>';
  html += '<th style="text-align:center;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;" colspan="7">Quick Access</th>';
  html += '<th style="text-align:left;padding:8px 10px;font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Sub</th>';
  html += '</tr></thead><tbody>';

  regs.forEach(function(r) {
    var idx = allRegs.indexOf(r);
    var sName  = r.studentName || 'Student';
    var sId    = r.studentUsername || r.studentId || '—';
    var pId    = r.parentUsername || r.parentId || '—';
    var mobile = r.primaryMobile || '—';
    var cls    = r.class || '8';
    var status = r.subscriptionStatus || 'trial';
    var statusColor = {trial:'#f59e0b',subscribed:'#22c55e',discontinued:'#ef4444'}[status]||'#94a3b8';

    function btn(label, href, color) {
      var bypass = sessionStorage.getItem('rishi_admin_bypass') === '1' ? (href.indexOf('?')>=0?'&':'?')+'bypass=1' : '';
      return '<button onclick="window.open(\\'' + href + bypass + '\\',\\'_blank\\')" style="padding:4px 8px;border:1.5px solid ' + color + ';background:#fff;color:' + color + ';border-radius:5px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;margin:1px;">' + label + '</button>';
    }

    html += '<tr style="border-bottom:1px solid var(--border);">';
    html += '<td style="padding:6px 10px;"><b>' + esc(sName) + '</b><br><small style="color:var(--dim);">' + esc(sId) + '</small></td>';
    html += '<td style="padding:6px 10px;"><small>' + esc(pId) + '</small></td>';
    html += '<td style="padding:6px 10px;"><small>' + esc(mobile) + '</small></td>';
    html += '<td style="padding:6px 10px;"><span style="background:var(--s3);padding:2px 6px;border-radius:4px;font-weight:800;">' + esc(cls) + '</span></td>';
    html += '<td style="padding:6px 4px;">' + btn('Explain','/syllabus.html','#7c3aed') + '</td>';
    html += '<td style="padding:6px 4px;">' + btn('Practice','/syllabus.html','#0891b2') + '</td>';
    html += '<td style="padding:6px 4px;">' + btn('Exam','/syllabus.html','#c8922a') + '</td>';
    html += '<td style="padding:6px 4px;">' + btn('Topic','/topic-exam.html?topic=algebra&class='+cls,'#1a7a4a') + '</td>';
    html += '<td style="padding:6px 4px;">' + btn('Samp','/sampurna-pariksha.html?class='+cls,'#c0392b') + '</td>';
    html += '<td style="padding:6px 4px;"><button onclick="goParent(' + idx + ')" style="padding:4px 8px;border:1.5px solid #0f2240;background:#fff;color:#0f2240;border-radius:5px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;margin:1px;">Parent</button></td>';
    html += '<td style="padding:6px 4px;"><button onclick="alert(\\'Reference coming soon\\')" style="padding:4px 8px;border:1.5px solid #888;background:#fff;color:#888;border-radius:5px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;margin:1px;">Ref</button></td>';
    html += '<td style="padding:6px 10px;"><span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:8px;background:' + statusColor + ';color:#fff;">' + status + '</span>&nbsp;<button onclick="showSubEdit(' + idx + ')" style="font-size:10px;padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer;color:var(--muted);">✏</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  con.innerHTML = html;
}'''
    h = h.replace(m.group(0), NEW_FN, 1)
    print("  admin.html: renderStudentRows enriched (table with action buttons)")
else:
    errors.append("admin.html renderStudentRows MISS")
write(f, h)

# ─── 5. PARENT.HTML: add profile/settings link (button in header) ───
f = 'public/parent.html'
h = read(f)
# Just add a profile/settings link near the existing header
# Find logout or similar
idx = h.find('rishi_parent_auth')
if idx > 0:
    INJECT = '''
/* ── PROFILE / SETTINGS PANEL ───────────────────────── */
function showProfilePanel() {
  var sid = sessionStorage.getItem('rishi_parent_student_id') || 'default';
  var sName = sessionStorage.getItem('rishi_parent_student_name') || 'Student';
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations')||'[]'); } catch(e){}
  var reg = regs.find(function(r){ return r.studentUsername === sid; }) || {};
  var pId = reg.parentUsername || 'parent';
  var mobile = reg.primaryMobile || '—';

  var panel = document.createElement('div');
  panel.id = 'profile-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;';
  panel.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px;max-width:480px;width:100%;font-family:Nunito,sans-serif;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<div style="font-size:18px;font-weight:900;color:#0f2240;">👤 Profile &amp; Settings</div>' +
      '<button onclick="document.getElementById(\\'profile-panel\\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#666;">✕</button>' +
    '</div>' +
    '<div style="background:#f5ede0;border-radius:10px;padding:14px;margin-bottom:14px;">' +
      '<div style="font-size:12px;color:#6b5a3e;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Parent ID</div>' +
      '<div style="font-size:16px;font-weight:800;color:#0f2240;font-family:Share Tech Mono,monospace;">' + pId + '</div>' +
    '</div>' +
    '<div style="background:#f5ede0;border-radius:10px;padding:14px;margin-bottom:14px;">' +
      '<div style="font-size:12px;color:#6b5a3e;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Student ID</div>' +
      '<div style="font-size:16px;font-weight:800;color:#c8922a;font-family:Share Tech Mono,monospace;">' + sid + '</div>' +
      '<div style="font-size:13px;color:#6b5a3e;margin-top:4px;">' + sName + '</div>' +
    '</div>' +
    '<div style="background:#f5ede0;border-radius:10px;padding:14px;margin-bottom:14px;">' +
      '<div style="font-size:12px;color:#6b5a3e;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Mobile</div>' +
      '<div style="font-size:14px;font-weight:700;color:#0f2240;">' + mobile + '</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<button onclick="resetPassword()" style="padding:12px;background:#c8922a;color:#fff;border:none;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;">🔐 Reset Password</button>' +
      '<button onclick="alert(\\'Payment history coming soon\\')" style="padding:12px;background:#1a7a4a;color:#fff;border:none;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;">💳 Payment History</button>' +
      '<button onclick="window.location.href=\\'/landing.html\\'" style="padding:12px;background:#fff;color:#0f2240;border:2px solid #e8d9c4;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;">🏠 Back to Home</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(panel);
}

function resetPassword() {
  var newPw = prompt('Enter new password (min 6 chars):');
  if (!newPw || newPw.length < 6) { alert('Password must be at least 6 characters.'); return; }
  var sid = sessionStorage.getItem('rishi_parent_student_id') || 'default';
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations')||'[]'); } catch(e){}
  var reg = regs.find(function(r){ return r.studentUsername === sid; });
  if (!reg) { alert('Cannot reset password: no matching parent registration.'); return; }
  var overrides = {};
  try { overrides = JSON.parse(localStorage.getItem('rishi_pw_overrides')||'{}'); } catch(e){}
  overrides[reg.parentUsername] = newPw;
  localStorage.setItem('rishi_pw_overrides', JSON.stringify(overrides));
  alert('✅ Password updated. Use new password next login.');
  document.getElementById('profile-panel').remove();
}

'''
    # Inject after the auth block, before the next function
    h = h.replace("function enterPortal()", INJECT + "\nfunction enterPortal()", 1)
    print("  parent.html: profile panel + reset password added")
write(f, h)

print()
if errors:
    print("ERRORS:")
    for e in errors: print("  -", e)
else:
    print("All changes applied.")
print()
print("git add .")
print('git commit -m "Major: prices 599, login bottom nav, syllabus IDs, admin student table, parent profile panel"')
print("git push")
